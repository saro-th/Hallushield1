# backend/services/verification_service.py

from datetime import datetime, timezone
import uuid
from models.schemas import VerifyRequest, VerifyResponse, ConfidenceLevel, VerificationSignals, AuditRecord
from utils.hashing import calculate_artifact_hash
from services.agent_orchestrator import VerificationAgent, ReviewAgent
from config import settings
from models.schemas import (
    VerifyRequest,
    VerifyResponse,
    VerificationVerdict,  # <-- Add this import
    ConfidenceLevel,
    VerificationSignals,
    AuditRecord,
)

verification_agent = VerificationAgent()
review_agent = ReviewAgent()

def run_verification_pipeline(payload: VerifyRequest) -> VerifyResponse:
    source_hash = calculate_artifact_hash(payload.source_artifact.files)
    gen_hash = calculate_artifact_hash(payload.generated_artifact.files)

    # 1. Verification Agent orchestrates deterministic tools
    investigation = verification_agent.orchestrate_verification(payload)

    # 2. Review Agent validates findings and computes verifiability
    has_executable = len(investigation["matched_units"]) > 0
    verdict, verifiability, scopes, summary, action = review_agent.review_investigation(
        investigation,
        has_executable_units=has_executable,
    )

    confidence = ConfidenceLevel.HIGH if verdict != VerificationVerdict.INCONCLUSIVE else ConfidenceLevel.LOW
    v_id = f"VH-{uuid.uuid4().hex[:8].upper()}"

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
            structural=investigation["structural_signal"],
            semantic=investigation["behavioural_signal"],
            behavioural=investigation["behavioural_signal"],
        ),
        matched_units=investigation["matched_units"],
        divergences=investigation["divergences"],
        conflict_report=investigation["conflict_report"],
        audit=AuditRecord(
            verifier_version=settings.verifier_version,
            timestamp=datetime.now(timezone.utc).isoformat(),
            source_hash=source_hash,
            generated_hash=gen_hash,
            total_tests=investigation["total_tests"],
            passed_tests=investigation["passed_tests"],
            divergences_count=len(investigation["divergences"]),
        ),
    )
    