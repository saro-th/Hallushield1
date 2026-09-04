# backend/services/agent_orchestrator.py

import json
import logging
import os
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

from config import settings
from models.schemas import (
    AgentInvestigationTrace,
    AgentReviewSynthesis,
    ConfidenceLevel,
    DivergenceDetail,
    DomainContext,
    SignalStatus,
    VerifiabilityModel,
    VerifiabilityStatus,
    VerificationScopeItem,
    VerificationVerdict,
    VerifyRequest,
)
from services.artifact_parser import parse_python_file
from services.behavioural_verifier import verify_unit_behaviour
from services.conflict_service import detect_evidence_conflicts
from services.evidence_service import infer_domain, resolve_evidence_for_divergence
from services.structural_analyzer import analyze_structure

logger = logging.getLogger("hallushield.agents")


def query_live_llm(prompt: str, max_tokens: int = 150) -> Optional[str]:
    """Invokes real LLM if OPENAI_API_KEY is present in environment.
    
    Falls back gracefully to None if key is missing, network is offline,
    or request times out (bounded at 3.0 seconds).
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or not api_key.strip():
        return None

    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key.strip()}",
        }
        body = json.dumps({
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a code verification auditor. Be concise, authoritative, and technical.",
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.2,
        }).encode("utf-8")

        req = urllib.request.Request(url, data=body, headers=headers)
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"].strip()
    except Exception as exc:
        logger.warning(f"Live LLM query bypassed or timed out: {exc}")
        return None


def _generate_agent_triage(domain: DomainContext, matched_units: list) -> List[str]:
    """Generates genuine, zero-credential AST-driven triage hypotheses."""
    hypotheses = []
    for m in matched_units:
        hypotheses.append(f"Inspect unit '{m.name}' for interface & signature stability")
        if domain == DomainContext.NUMERICAL:
            hypotheses.append(
                f"Triage floating-point vs. integer truncation & banker's rounding in '{m.name}'"
            )
        elif domain == DomainContext.SYSTEMS:
            hypotheses.append(
                f"Audit exception handling branches and zero-crossing traps in '{m.name}'"
            )
        elif domain == DomainContext.DATA_PROCESSING:
            hypotheses.append(
                f"Verify sequence indexing, collection mutations, and empty-state handling in '{m.name}'"
            )
        else:
            hypotheses.append(
                f"Check boundary relational operators ('>=' vs '>') and branch reachability in '{m.name}'"
            )
    return hypotheses


class VerificationAgent:
    """Agent 1: Ingests code & AST diffs, infers domain context, and targets test generation."""

    def orchestrate_verification(self, payload: VerifyRequest) -> Dict[str, Any]:
        steps: List[str] = []

        # 1. Ingest code
        src_files = {f.path: f.content for f in payload.source_artifact.files}
        gen_files = {f.path: f.content for f in payload.generated_artifact.files}
        src_raw = "\n".join(src_files.values())
        gen_raw = "\n".join(gen_files.values())

        # 2. Domain Detection
        domain = infer_domain(src_raw, gen_raw)
        steps.append(f"Inferred domain context: {domain.value}")

        # 3. Deterministic AST Analysis
        src_parsed = [parse_python_file(f.path, f.content) for f in payload.source_artifact.files]
        gen_parsed = [parse_python_file(f.path, f.content) for f in payload.generated_artifact.files]
        steps.append(f"Parsed AST: {len(src_parsed)} source, {len(gen_parsed)} generated files")

        struct_signal, matched_units, struct_divergences = analyze_structure(src_parsed, gen_parsed)
        steps.append(f"Matched {len(matched_units)} code unit(s) across structural AST signatures")

        # 4. Agent Triage & Hypothesis Formation
        hypotheses = _generate_agent_triage(domain, matched_units)

        # Optional live LLM triage enhancement
        unit_names = [m.name for m in matched_units]
        llm_triage = query_live_llm(
            f"Code units: {unit_names}. Technical domain: {domain.value}. "
            "List 2 specific boundary risks or floating-point mutation risks to check."
        )
        is_llm_active = bool(llm_triage)
        if llm_triage:
            hypotheses.append(f"LLM Triage Note: {llm_triage}")

        trace = AgentInvestigationTrace(
            domain_detected=domain,
            triage_hypotheses=hypotheses,
            focus_units=unit_names,
            llm_assisted=is_llm_active,
        )

        all_divergences = list(struct_divergences)
        total_tests = 0
        passed_tests = 0
        behav_signal = SignalStatus.PASS

        # 5. Deterministic Sandbox Execution (Authoritative)
        if struct_signal != SignalStatus.FAIL:
            src_units = {u.name: u for p in src_parsed for u in p.units}
            gen_units = {u.name: u for p in gen_parsed for u in p.units}

            for match in matched_units:
                s_unit = src_units.get(match.name)
                g_unit = gen_units.get(match.name)
                if s_unit and g_unit:
                    b_status, tests, b_divs = verify_unit_behaviour(
                        src_files[s_unit.file_path],
                        gen_files[g_unit.file_path],
                        s_unit,
                        g_unit,
                    )
                    total_tests += len(tests)
                    unit_passed = sum(1 for t in tests if t.status == SignalStatus.PASS)
                    passed_tests += unit_passed
                    all_divergences.extend(b_divs)
                    steps.append(f"Executed boundary sandbox for '{match.name}': {unit_passed}/{len(tests)} passed")
                    if b_status == SignalStatus.FAIL:
                        behav_signal = SignalStatus.FAIL

            steps.append(f"Deterministic sandbox verified: {passed_tests}/{total_tests} test runs equivalent")
        else:
            steps.append("Structural failure isolated; behavioural sandbox skipped")

        # 6. Tiered Evidence Resolution
        for d in all_divergences:
            d.evidence = resolve_evidence_for_divergence(d.type, domain)

        if all_divergences:
            steps.append(f"Classified {len(all_divergences)} divergence(s) with Tier 1/2 authoritative evidence")
        else:
            steps.append("Zero behavioural divergences detected within synthesized vector space")

        conflict_report = detect_evidence_conflicts([ev for d in all_divergences for ev in (d.evidence or [])])
        steps.append("Escalated findings to ReviewAgent for scoped integrity audit")

        return {
            "domain": domain,
            "structural_signal": struct_signal,
            "behavioural_signal": behav_signal,
            "matched_units": matched_units,
            "divergences": all_divergences,
            "conflict_report": conflict_report,
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "agent_steps": steps,
            "investigation_trace": trace,
        }


class ReviewAgent:
    """Agent 2: Evaluates deterministic facts + tiered evidence to produce explanations."""

    def __init__(self):
        self.last_synthesis: Optional[AgentReviewSynthesis] = None

    def review_investigation(
        self,
        investigation: Dict[str, Any],
        has_executable_units: bool,
    ) -> Tuple[VerificationVerdict, VerifiabilityModel, List[VerificationScopeItem], str, str]:
        divergences: List[DivergenceDetail] = investigation["divergences"]
        total_tests = investigation["total_tests"]
        passed_tests = investigation["passed_tests"]
        conflict_report = investigation["conflict_report"]
        domain = investigation.get("domain", DomainContext.GENERAL_LOGIC)

        scopes = [
            VerificationScopeItem(
                name="Structural Equivalence",
                evaluated=True,
                status=investigation["structural_signal"],
                details="AST nodes, exported functions, and arity inspected.",
            ),
            VerificationScopeItem(
                name="Behavioural Equivalence",
                evaluated=has_executable_units,
                status=investigation["behavioural_signal"] if has_executable_units else SignalStatus.SKIPPED,
                details="Subprocess differential execution across synthesized test vectors.",
            ),
            VerificationScopeItem(
                name="Boundary Condition Behaviour",
                evaluated=has_executable_units and total_tests > 0,
                status=investigation["behavioural_signal"],
                details="Exact relational comparisons, off-by-one checks, and zero-crossings evaluated.",
            ),
            VerificationScopeItem(
                name="Exception Handling Behaviour",
                evaluated=has_executable_units,
                status=SignalStatus.FAIL if any("EXCEPTION" in d.type.value for d in divergences) else SignalStatus.PASS,
                details="Zero division, invalid operand types, and runtime exceptions checked.",
            ),
        ]

        unevaluated = ["Performance & Resource Equivalence", "Concurrent Thread Safety"]
        limitations = [
            "Formal mathematical equivalence is not established; verification is strictly bounded to tested vectors.",
            "Subprocess execution timeout bounded at 2.0 seconds.",
        ]

        # Deterministic ground truth
        if conflict_report and conflict_report.status.value == "CONFLICTING_EVIDENCE":
            verdict = VerificationVerdict.CONFLICTING_EVIDENCE
            verifiability = VerifiabilityStatus.PARTIAL
            summary = "Authoritative specifications or evidence sources provide contradictory criteria."
            action = "Clarify target domain specification rules before adopting generated code."
        elif divergences:
            verdict = VerificationVerdict.DIVERGENCE_DETECTED
            verifiability = VerifiabilityStatus.YES
            primary = divergences[0]
            summary = f"Divergence detected in function `{primary.function}`: {primary.explanation}"
            action = f"Review changed implementation in function `{primary.function}` before accepting artefact."
        elif total_tests > 0 and passed_tests == total_tests:
            verdict = VerificationVerdict.VERIFIED
            verifiability = VerifiabilityStatus.YES
            summary = "No divergence detected within tested scope across synthesized boundary vectors."
            action = "Code refactoring preserves observed input-output behaviour for tested paths."
        else:
            verdict = VerificationVerdict.INCONCLUSIVE
            verifiability = VerifiabilityStatus.NO
            summary = "Insufficient executable units available to establish behavioural equivalence."
            action = "Ensure Python artefacts contain valid, callable unit definitions."

        verifiability_model = VerifiabilityModel(
            verifiable=verifiability,
            evaluated_scopes=[s.name for s in scopes if s.evaluated],
            unevaluated_scopes=unevaluated,
            limitations=limitations,
        )

        domain_val = getattr(domain, "value", str(domain))

        # Query live LLM for executive synthesis (never altering deterministic verdict)
        llm_review = query_live_llm(
            f"Audit finding for domain {domain_val}:\nVerdict: {verdict.value}\nSummary: {summary}\nAction: {action}\n"
            "Provide a 1-sentence technical synthesis on potential deployment side-effects."
        )

        synthesis_notes = llm_review if llm_review else (
            f"Domain: {domain_val}. Isolated {len(divergences)} divergence(s) across tested vectors."
            if divergences else
            f"Domain: {domain_val}. Structural and behavioral signatures hold across synthesized boundary checks."
        )

        self.last_synthesis = AgentReviewSynthesis(
            executive_summary=summary,
            recommended_action=action,
            uncertainty_notes=synthesis_notes,
            llm_assisted=bool(llm_review),
        )

        # EXACT 5-TUPLE RETURN (Preserves compatibility with all tests and services)
        return verdict, verifiability_model, scopes, summary, action