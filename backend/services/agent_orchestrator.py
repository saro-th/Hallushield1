# backend/services/agent_orchestrator.py

from typing import List, Dict, Any, Tuple
from models.schemas import (
    VerifyRequest,
    VerificationVerdict,
    ConfidenceLevel,
    SignalStatus,
    DivergenceDetail,
    VerifiabilityStatus,
    VerifiabilityModel,
    VerificationScopeItem,
)
from services.artifact_parser import parse_python_file
from services.structural_analyzer import analyze_structure
from services.behavioural_verifier import verify_unit_behaviour
from services.evidence_service import resolve_evidence_for_divergence
from services.conflict_service import detect_evidence_conflicts

class VerificationAgent:
    """Agent 1: Orchestrates deterministic tool execution and forms evidence-grounded hypotheses."""

    def orchestrate_verification(self, payload: VerifyRequest) -> Dict[str, Any]:
        # 1. Deterministic AST Analysis
        src_parsed = [parse_python_file(f.path, f.content) for f in payload.source_artifact.files]
        gen_parsed = [parse_python_file(f.path, f.content) for f in payload.generated_artifact.files]

        struct_signal, matched_units, struct_divergences = analyze_structure(src_parsed, gen_parsed)
        all_divergences = list(struct_divergences)
        total_tests = 0
        passed_tests = 0
        behav_signal = SignalStatus.PASS

        # 2. Targeted Behavioural Verification
        if struct_signal != SignalStatus.FAIL:
            src_files = {f.path: f.content for f in payload.source_artifact.files}
            gen_files = {f.path: f.content for f in payload.generated_artifact.files}
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
                    passed_tests += sum(1 for t in tests if t.status == SignalStatus.PASS)
                    all_divergences.extend(b_divs)
                    if b_status == SignalStatus.FAIL:
                        behav_signal = SignalStatus.FAIL

        # 3. Evidence Gathering
        for d in all_divergences:
            d.evidence = resolve_evidence_for_divergence(d.type)

        conflict_report = detect_evidence_conflicts([ev for d in all_divergences for ev in (d.evidence or [])])

        return {
            "structural_signal": struct_signal,
            "behavioural_signal": behav_signal,
            "matched_units": matched_units,
            "divergences": all_divergences,
            "conflict_report": conflict_report,
            "total_tests": total_tests,
            "passed_tests": passed_tests,
        }

class ReviewAgent:
    """Agent 2: Challenges preliminary conclusions, inspects edge boundaries, and evaluates verifiability."""

    def review_investigation(
        self,
        investigation: Dict[str, Any],
        has_executable_units: bool,
    ) -> Tuple[VerificationVerdict, VerifiabilityModel, List[VerificationScopeItem], str, str]:
        divergences: List[DivergenceDetail] = investigation["divergences"]
        total_tests = investigation["total_tests"]
        passed_tests = investigation["passed_tests"]
        conflict_report = investigation["conflict_report"]

        # Define evaluated scopes
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
                details="Isolated execution across synthesized test vectors.",
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
            "Execution timeout bounded at 2.0 seconds.",
        ]

        if conflict_report and conflict_report.status.value == "CONFLICTING_EVIDENCE":
            verdict = VerificationVerdict.CONFLICTING_EVIDENCE
            verifiability = VerifiabilityStatus.PARTIAL
            summary = "Authoritative specifications or evidence sources provide contradictory criteria."
            action = "Clarify target domain specification rules before adopting generated code."
        elif divergences:
            verdict = VerificationVerdict.DIVERGENCE_DETECTED
            verifiability = VerifiabilityStatus.YES
            primary_div = divergences[0]
            summary = f"Divergence detected in function `{primary_div.function}`: {primary_div.explanation}"
            action = f"Inspect function `{primary_div.function}` at boundary or exception inputs before deployment."
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

        return verdict, verifiability_model, scopes, summary, action