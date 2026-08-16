"""Unit and Integration Tests for PDF Generator and PDF Download Endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.store import claim_repo
from app.main import app
from app.utils.pdf_generator import generate_denial_pdf, generate_settlement_pdf


def test_generate_settlement_pdf_binary():
    """Verify generate_settlement_pdf produces valid PDF binary starting with %PDF-."""
    claim = claim_repo.get_by_id("clm-auto-001")
    assert claim is not None

    pdf_bytes = generate_settlement_pdf(claim)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")


def test_generate_denial_pdf_binary():
    """Verify generate_denial_pdf produces valid PDF binary starting with %PDF-."""
    claim = claim_repo.get_by_id("clm-prop-002")
    assert claim is not None

    pdf_bytes = generate_denial_pdf(claim)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")


@pytest.mark.asyncio
async def test_api_v1_download_settlement_pdf():
    """Verify GET /api/v1/claims/{id}/documents/settlement-pdf returns 200 and application/pdf."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/claims/clm-auto-001/documents/settlement-pdf")
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert "attachment; filename=" in res.headers["content-disposition"]
        assert res.content.startswith(b"%PDF-")


@pytest.mark.asyncio
async def test_api_v1_download_denial_pdf():
    """Verify GET /api/v1/claims/{id}/documents/denial-pdf returns 200 and application/pdf."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/claims/clm-prop-002/documents/denial-pdf")
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert "attachment; filename=" in res.headers["content-disposition"]
        assert res.content.startswith(b"%PDF-")
