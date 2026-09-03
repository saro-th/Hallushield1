import pytest
from httpx import AsyncClient, ASGITransport
from app import app

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_verify_endpoint_handshake():
    transport = ASGITransport(app=app)
    payload = {
        "source_artifact": {
            "language": "python",
            "files": [{"path": "calc.py", "content": "def add(a, b): return a + b\n"}]
        },
        "generated_artifact": {
            "language": "python",
            "files": [{"path": "calc.py", "content": "def add(a, b): return a + b\n"}]
        }
    }
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/verify", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "verification_id" in data
        assert len(data["audit"]["source_hash"]) == 64