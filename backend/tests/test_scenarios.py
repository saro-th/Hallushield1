import pytest
from httpx import AsyncClient, ASGITransport
from app import app

@pytest.mark.asyncio
async def test_get_scenarios_returns_five_benchmarks():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/scenarios")
        assert res.status_code == 200
        data = res.json()
        assert data["total_scenarios"] >= 5
        categories = {s["category"] for s in data["scenarios"]}
        assert {"numerical", "boundary", "refactoring", "structural", "exception"}.issubset(categories)
        for s in data["scenarios"]:
            assert "source_artifact" in s
            assert "generated_artifact" in s
            assert "expected_verdict" in s