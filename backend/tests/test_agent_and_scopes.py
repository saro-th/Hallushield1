import pytest
from httpx import AsyncClient, ASGITransport
from app import app
from models.schemas import VerificationVerdict, SignalStatus

@pytest.mark.asyncio
async def test_agent_orchestration_boundary_divergence():
    transport = ASGITransport(app=app)
    payload = {
        "source_artifact": {
            "language": "python",
            "files": [
                {
                    "path": "discount.py",
                    "content": "def calculate_discount(price):\n    if price >= 1000:\n        return price * 0.9\n    return price\n"
                }
            ]
        },
        "generated_artifact": {
            "language": "python",
            "files": [
                {
                    "path": "discount.py",
                    "content": "def calculate_discount(price):\n    if price > 1000:\n        return price * 0.9\n    return price\n"
                }
            ]
        }
    }

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/verify", json=payload)
        assert res.status_code == 200
        data = res.json()

        # Check Verdict & Explanations
        assert data["verdict"] == VerificationVerdict.DIVERGENCE_DETECTED.value
        assert "discount" in data["summary"].lower()
        assert len(data["divergences"]) > 0

        # Check Scope Evaluations
        if "verification_scopes" in data and data["verification_scopes"]:
            scopes = {s["name"]: s for s in data["verification_scopes"]}
            assert "Structural Equivalence" in scopes
            assert "Boundary Condition Behaviour" in scopes

@pytest.mark.asyncio
async def test_agent_orchestration_clean_refactoring():
    transport = ASGITransport(app=app)
    payload = {
        "source_artifact": {
            "language": "python",
            "files": [
                {
                    "path": "math_ops.py",
                    "content": "def add_tax(val, rate):\n    return round(val * (1 + rate), 2)\n"
                }
            ]
        },
        "generated_artifact": {
            "language": "python",
            "files": [
                {
                    "path": "math_ops.py",
                    "content": "def add_tax(val, rate):\n    factor = 1 + rate\n    return round(val * factor, 2)\n"
                }
            ]
        }
    }

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/verify", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert data["verdict"] == VerificationVerdict.VERIFIED.value
        assert len(data["divergences"]) == 0
        assert data["verification_signals"]["behavioural"] == SignalStatus.PASS.value