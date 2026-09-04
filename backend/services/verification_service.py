# backend/services/verification_service.py

from datetime import datetime, timezone
import uuid
from typing import List

from config import settings
from models.schemas import (
    AuditRecord,
    ConfidenceLevel,
    StructuralSummary,
    VerificationSignals,
    VerificationVerdict,
    VerifyRequest,
    VerifyResponse,
    AgentReviewSynthesis,
)
from services.agent_orchestrator import ReviewAgent, VerificationAgent
from utils.hashing import calculate_artifact_hash

verification_agent = VerificationAgent()
review_agent = ReviewAgent()


def run_verification_pipeline(payload: VerifyRequest) -> VerifyResponse:
    source_hash = calculate_artifact_hash(payload.source_artifact.files)
    gen_hash = calculate_artifact_hash(payload.generated_artifact.files)

    # 1. Verification Agent orchestrates deterministic tools
    investigation = verification_agent.orchestrate_verification(payload)

    # 2. Review Agent validates findings and computes verifiability (Unpacks 5 items)
    has_executable = len(investigation.get("matched_units", [])) > 0
    verdict, verifiability, scopes, summary, action = review_agent.review_investigation(
        investigation,
        has_executable_units=has_executable,
    )

    confidence = (
        ConfidenceLevel.HIGH
        if verdict != VerificationVerdict.INCONCLUSIVE
        else ConfidenceLevel.LOW
    )
    v_id = f"VH-{uuid.uuid4().hex[:8].upper()}"

    # 3. Compute structural metadata summary
    matched_units = investigation.get("matched_units", [])
    divergences = investigation.get("divergences", [])
    structural_diffs = sum(
        1 for d in divergences if "STRUCTURAL" in str(getattr(d, "type", ""))
    )
    structural_summary = StructuralSummary(
        matched_units_count=len(matched_units),
        signatures_preserved_count=max(0, len(matched_units) - structural_diffs),
        structural_differences_count=structural_diffs,
    )

    domain_val = investigation.get("domain")
    domain_str = getattr(domain_val, "value", str(domain_val)) if domain_val else "GENERAL_LOGIC"
    synthesis = AgentReviewSynthesis(
        executive_summary=summary,
        recommended_action=action,
        uncertainty_notes=f"Domain: {domain_str}. Verification restricted to sandboxed execution vectors.",
        llm_assisted=False,
    )

    return VerifyResponse(
        verification_id=v_id,
        verdict=verdict,
        confidence=confidence,
        confidence_reasons=[summary] if summary else [],
        summary=summary,
        recommended_action=action,
        verifiability=verifiability,
        verification_scopes=scopes,
        verification_signals=VerificationSignals(
            structural=investigation.get("structural_signal"),
            semantic=investigation.get("behavioural_signal"),
            behavioural=investigation.get("behavioural_signal"),
        ),
        structural_summary=structural_summary,
        investigation_trace=investigation.get("investigation_trace"),
        review_synthesis=synthesis,
        agent_steps=investigation.get("agent_steps", []),
        matched_units=matched_units,
        divergences=divergences,
        conflict_report=investigation.get("conflict_report"),
        audit=AuditRecord(
            verifier_version=settings.verifier_version,
            timestamp=datetime.now(timezone.utc).isoformat(),
            source_hash=source_hash,
            generated_hash=gen_hash,
            total_tests=investigation.get("total_tests", 0),
            passed_tests=investigation.get("passed_tests", 0),
            divergences_count=len(divergences),
        ),
    )