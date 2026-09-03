from fastapi import APIRouter, HTTPException, status
from models.schemas import VerifyRequest, VerifyResponse
from services.verification_service import run_verification_pipeline
from services.audit_service import audit_store

router = APIRouter(prefix="/api", tags=["verification"])

@router.post(
    "/verify",
    response_model=VerifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Inspect and verify an AI-generated code artifact against its source",
)
async def verify_artifact(payload: VerifyRequest) -> VerifyResponse:
    if not payload.source_artifact.files or not payload.generated_artifact.files:
        raise HTTPException(
            status_code=status.status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Both source and generated artifacts must provide at least one file.",
        )

    # 1. Run the core verification engine
    response = run_verification_pipeline(payload)
    
    # 2. Store the snapshot in memory for audit retrieval
    audit_store.save_snapshot(payload, response)
    
    return response