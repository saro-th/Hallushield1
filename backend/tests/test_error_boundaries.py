import pytest
from httpx import AsyncClient, ASGITransport
from app import app
from models.schemas import DivergenceType

@pytest.mark.asyncio
async def test_infinite_loop_caught_by_sandbox_timeout():
    transport = ASGITransport(app=app)
    payload = {
        "source_artifact": {
            "language": "python",
            "files": [
                {
                    "path": "loop.py",
                    "content": "def run_task(n):\n    return n * 2\n"
                }
            ]
        },
        "generated_artifact": {
            "language": "python",
            "files": [
                {
                    "path": "loop.py",
                    "content": "def run_task(n):\n    while True:\n        pass\n"
                }
            ]
        }
    }
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/verify", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["verdict"] == "DIVERGENCE_DETECTED"
        assert data["verification_signals"]["behavioural"] == "FAIL"
        assert len(data["divergences"]) > 0
        div = data["divergences"][0]
        assert div["type"] == DivergenceType.CONTROL_FLOW_MISMATCH
        assert "timeout" in div["explanation"].lower()

@pytest.mark.asyncio
async def test_syntax_error_handled_gracefully():
    transport = ASGITransport(app=app)
    payload = {
        "source_artifact": {
            "language": "python",
            "files": [
                {
                    "path": "valid.py",
                    "content": "def add(a, b): return a + b\n"
                }
            ]
        },
        "generated_artifact": {
            "language": "python",
            "files": [
                {
                    "path": "broken.py",
                    "content": "def add(a, b\n    return a + b\n"
                }
            ]
        }
    }
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/verify", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["verdict"] == "DIVERGENCE_DETECTED"
        assert data["verification_signals"]["structural"] == "FAIL"
        assert len(data["divergences"]) > 0
        assert "SyntaxError" in data["divergences"][0]["actual_behaviour"]

@pytest.mark.asyncio
async def test_evaluation_export_markdown():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/evaluate/export")
        assert res.status_code == 200
        assert "text/markdown" in res.headers["content-type"]
        assert "HALLUCINATION HUNTER" in res.text
        assert "Empirical Impact Metrics" in res.text