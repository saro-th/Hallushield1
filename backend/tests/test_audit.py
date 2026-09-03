import pytest
from httpx import AsyncClient, ASGITransport
from app import app

@pytest.mark.asyncio
async def test_audit_lifecycle():
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
        # 1. Run verification
        verify_res = await client.post("/api/verify", json=payload)
        assert verify_res.status_code == 200
        v_id = verify_res.json()["verification_id"]

        # 2. Retrieve audit snapshot
        audit_res = await client.get(f"/api/audit/{v_id}")
        assert audit_res.status_code == 200
        snapshot = audit_res.json()
        assert snapshot["verification_id"] == v_id
        assert len(snapshot["source_hash"]) == 64
        assert len(snapshot["generated_hash"]) == 64
        assert snapshot["verdict"] == "VERIFIED"
        assert "timestamp" in snapshot

        # 3. Non-existent ID returns 404
        bad_res = await client.get("/api/audit/VH-NONEXISTENT")
        assert bad_res.status_code == 404
        assert "not found" in bad_res.json()["detail"].lower()