import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_api_v1_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["api_version"] == "v1"
        assert data["claims_loaded"] >= 4


@pytest.mark.asyncio
async def test_api_v1_seed_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Test Seed trigger
        res = await ac.post("/api/v1/seed")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["claims_count"] >= 4

        # Test Seed scenarios listing
        res_scenarios = await ac.get("/api/v1/seed/scenarios")
        assert res_scenarios.status_code == 200
        scenarios = res_scenarios.json()
        assert len(scenarios) == 4
        assert scenarios[0]["line"] == "AUTO"


@pytest.mark.asyncio
async def test_api_v1_claims_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. List claims
        res = await ac.get("/api/v1/claims")
        assert res.status_code == 200
        claims = res.json()
        assert len(claims) >= 4
        claim_id = claims[0]["id"]

        # 2. Get claim detail
        res_det = await ac.get(f"/api/v1/claims/{claim_id}")
        assert res_det.status_code == 200
        assert res_det.json()["id"] == claim_id

        # 3. Process with StateGraph agent
        res_proc = await ac.post(f"/api/v1/claims/{claim_id}/process")
        assert res_proc.status_code == 200
        proc_state = res_proc.json()
        assert proc_state["is_completed"] is True
        assert len(proc_state["nodes"]) == 5
