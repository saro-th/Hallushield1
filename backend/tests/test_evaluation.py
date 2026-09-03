import pytest
from httpx import AsyncClient, ASGITransport
from app import app

@pytest.mark.asyncio
async def test_evaluate_benchmark_dataset():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/evaluate")
        assert res.status_code == 200
        data = res.json()
        assert data["total_cases"] >= 5
        metrics = data["metrics"]
        assert 0.0 <= metrics["divergence_detection_accuracy"] <= 1.0
        assert 0.0 <= metrics["behavioural_equivalence_pass_rate"] <= 1.0
        assert 0.0 <= metrics["false_positive_rate"] <= 1.0
        assert 0.0 <= metrics["false_negative_rate"] <= 1.0
        assert metrics["mean_verification_latency_ms"] > 0.0
        assert len(data["cases"]) == data["total_cases"]
        # Ensure the equivalent case and divergent cases behave as expected
        refactor_case = next(c for c in data["cases"] if c["category"] == "refactoring")
        assert refactor_case["actual_verdict"] == "VERIFIED"
        assert refactor_case["correct"] is True