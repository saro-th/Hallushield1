import pytest
from httpx import AsyncClient, ASGITransport
from app import app

@pytest.mark.asyncio
async def test_pipeline_flagship_rounding_divergence():
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
        response = await client.post("/api/verify", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["verdict"] == "DIVERGENCE_DETECTED"
        assert data["verification_signals"]["structural"] == "PASS"
        assert data["verification_signals"]["behavioural"] == "FAIL"
        assert data["audit"]["divergences_count"] > 0
        assert data["divergences"][0]["type"] == "NUMERICAL_MISMATCH"

@pytest.mark.asyncio
async def test_pipeline_verified_case():
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
                    "content": "def calculate_total(price, tax):\n    multiplier = 1 + tax\n    return round(price * multiplier, 2)\n"
                }
            ]
        }
    }
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/verify", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["verdict"] == "VERIFIED"
        assert data["verification_signals"]["structural"] == "PASS"
        assert data["verification_signals"]["behavioural"] == "PASS"
        assert data["audit"]["divergences_count"] == 0
        assert data["audit"]["total_tests"] > 0