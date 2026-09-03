import pytest
from httpx import AsyncClient, ASGITransport
from app import app

@pytest.mark.asyncio
async def test_divergence_includes_tier1_evidence():
    transport = ASGITransport(app=app)
    payload = {
        "source_artifact": {
            "language": "python",
            "files": [
                {
                    "path": "calc.py",
                    "content": "def calculate_total(price, tax):\n    return round(price * (1 + tax), 2)\n"
                }
            ]
        },
        "generated_artifact": {
            "language": "python",
            "files": [
                {
                    "path": "calc.py",
                    "content": "def calculate_total(price, tax):\n    return int(price * (1 + tax))\n"
                }
            ]
        }
    }
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/verify", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["verdict"] == "DIVERGENCE_DETECTED"
        assert len(data["divergences"]) > 0
        
        # Check evidence attached to divergence
        div = data["divergences"][0]
        assert "evidence" in div
        assert len(div["evidence"]) > 0
        evid = div["evidence"][0]
        assert evid["source_tier"] == "TIER_1"
        assert "https://docs.python.org" in evid["source_url"]
        assert evid["authority_score"] == 1.0
        
        # Check conflict report
        assert "conflict_report" in data
        assert data["conflict_report"]["status"] == "NO_CONFLICT"