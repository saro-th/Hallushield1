from typing import Dict, Optional
from models.schemas import AuditSnapshot, VerifyRequest, VerifyResponse

class InMemoryAuditStore:
    """Stateless in-memory registry storing reproducible verification snapshots."""
    def __init__(self):
        self._store: Dict[str, AuditSnapshot] = {}

    def save_snapshot(self, request: VerifyRequest, response: VerifyResponse) -> AuditSnapshot:
        snapshot = AuditSnapshot(
            verification_id=response.verification_id,
            source_artifact=request.source_artifact,
            generated_artifact=request.generated_artifact,
            source_hash=response.audit.source_hash,
            generated_hash=response.audit.generated_hash,
            timestamp=response.audit.timestamp,
            verifier_version=response.audit.verifier_version,
            verdict=response.verdict,
            confidence=response.confidence,
            confidence_reasons=response.confidence_reasons,
            verification_signals=response.verification_signals,
            matched_units=response.matched_units,
            divergences=response.divergences,
            conflict_report=response.conflict_report,
            audit_summary=response.audit,
        )
        self._store[response.verification_id] = snapshot
        return snapshot

    def get_snapshot(self, verification_id: str) -> Optional[AuditSnapshot]:
        return self._store.get(verification_id)

    def clear(self) -> None:
        self._store.clear()

audit_store = InMemoryAuditStore()