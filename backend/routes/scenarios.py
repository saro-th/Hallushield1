from fastapi import APIRouter, status
from data.evaluation_dataset import EVALUATION_DATASET
from models.schemas import ScenariosResponse

router = APIRouter(prefix="/api", tags=["scenarios"])

@router.get(
    "/scenarios",
    response_model=ScenariosResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve curated demo and benchmark scenarios",
)
async def get_scenarios() -> ScenariosResponse:
    return ScenariosResponse(
        total_scenarios=len(EVALUATION_DATASET),
        scenarios=EVALUATION_DATASET,
    )