from fastapi import APIRouter, HTTPException, status
from models.schemas import AuditSnapshot
from services.audit_service import audit_store

router = APIRouter(prefix="/api", tags=["audit"])

@router.get(
    "/audit/{verification_id}",
    response_model=AuditSnapshot,
    status_code=status.HTTP_200_OK,
    summary="Retrieve reproducible audit snapshot by verification ID",
)
async def get_audit_record(verification_id: str) -> AuditSnapshot:
    snapshot = audit_store.get_snapshot(verification_id)
    if not snapshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verification audit not found: {verification_id}",
        )
    return snapshot