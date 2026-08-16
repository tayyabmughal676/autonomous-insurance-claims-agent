---
name: insurance-agent-architecture
description: Technical Architecture, StateGraph Workflow, and Codebase Conventions for the Autonomous Insurance Claims Processing Platform. Use when modifying multi-agent graph nodes, ChromaDB vector stores, deterministic math rules, or API endpoints.
---

# Insurance Claims Multi-Agent Architecture Guide

This skill documents the end-to-end technical architecture, Dual-Engine StateGraph multi-agent execution pipeline, forensic analysis rules, and API conventions for the **Data Daur Autonomous Insurance Claims Processing Platform**.

---

## 1. Dual-Engine Multi-Agent Architecture

The platform supports dual runtime execution:
1. **Native StateGraph Orchestrator (`app/agents/graph.py`)**: Asynchronous, lightweight direct execution loop for fast debugging and zero-overhead performance.
2. **LangGraph Official Adapter (`app/agents/langgraph_adapter.py`)**: Formal `langgraph.graph.StateGraph` compiled runtime adhering to the LangGraph 1.2+ engine standard.

```
[Intake & OCR Agent] ──▶ [Policy RAG Agent] ──▶ [Fraud Forensics Agent] ──▶ [Deterministic Math] ──▶ [Supervisor Adjudicator]
   (2D Bounding Boxes)      (ChromaDB Cosine)      (EXIF & Price Anomaly)      (Indemnity Schedule)      (STP Rules & Letters)
```

### Node Responsibilities

1. **Multimodal Intake & OCR Agent (`intake_agent.py`)**:
   - Parses attached loss documents (damage photos, repair estimates, hospital UB-04s, police reports).
   - Extracts structured key-value entities and 2D bounding boxes `[ymin, xmin, ymax, xmax]`.
   - Runs local Pillow EXIF metadata forensics to detect timestamp inconsistencies.

2. **Policy RAG & Coverage Agent (`policy_rag_agent.py`)**:
   - Performs semantic vector queries against persistent ChromaDB collections.
   - Evaluates policy contracts (Auto Comprehensive, Property HO-3, Health PPO).
   - Flags policy exclusions (e.g., Section I Exclusion 3.a Ground Water Seepage).

3. **Fraud & Forensic Radar Agent (`fraud_agent.py`)**:
   - Synthesizes multi-vector fraud indicators:
     - `FRD-EXIF-001`: Photographic timestamp predates claimed loss date.
     - `FRD-INFL-002`: Fee schedule benchmark variance exceeding thresholds.
     - `FRD-PROC-003`: Unbundled administrative procedure charges.
   - Triggers mandatory Special Investigation Unit (SIU) referral when risk score ≥ 50/100.

4. **Zero-Hallucination Deterministic Financial Math Engine (`math_engine.py`)**:
   - Executes 100% in pure Python with exact floating-point arithmetic (zero LLM math hallucinations).
   - Subtraction sequence:
     - Gross Allowed = Sum of all Covered Item Amounts
     - After Deductible = max(0, Gross Allowed - Applicable Deductible)
     - Co-Insurance Amount = After Deductible * Co-Pay Rate
     - Net Recommended Payout = min(After Co-Insurance, Policy Coverage Limit)

5. **Adjudication Supervisor Agent (`adjudication_agent.py`)**:
   - Straight-Through Processing (STP) Rule Guardrails:
     - Total loss claimed ≤ $2,500.00
     - Overall fraud risk score < 15.0/100
     - Policy contract active with zero exclusions triggered.
   - Auto-generates formal settlement vouchers (`generate_settlement_letter`) or legal notices of claim declination (`generate_denial_letter`).

---

## 2. Codebase Standards & Hierarchy

### A. Python Backend Root Workspace (`/`)
- **Imports**: Always use absolute package imports (`from app.models...`, `from app.agents...`, `from app.rag...`, `from app.config import settings`). Never use relative imports (`..`).
- **Linters**:
  - `uv run pyrefly check .` MUST pass with **0 errors**.
  - `uv run ruff check .` MUST pass with **0 errors**.
- **CLI Runner**: Launch backend using `uv run fastapi dev main.py --port 8000`.

### B. React Frontend Child Workspace (`frontend/`)
- **TypeScript**: Strict mode enabled. Zero `any` types allowed.
- **Linters**: `bun run lint` (ESLint) MUST pass with **0 errors and 0 warnings**.
- **Build**: `bun run build` MUST compile cleanly.
- **Design Aesthetic**: Follow `enterprise-ui-design` skill (Linear / Stripe style, deep dark neutrals, JetBrains Mono for financials, Plus Jakarta Sans for titles).

---

## 3. Production API v1 Reference

All endpoints are versioned under `/api/v1/`:
- `GET /api/v1/health`
- `POST /api/v1/seed` & `GET /api/v1/seed/scenarios`
- `GET /api/v1/claims` & `POST /api/v1/claims`
- `GET /api/v1/claims/{id}`
- `POST /api/v1/claims/{id}/process?engine=native|langgraph`
- `GET /api/v1/claims/{id}/state`
- `POST /api/v1/claims/{id}/adjudicate`
- `GET /api/v1/claims/{id}/documents/settlement-pdf`
- `GET /api/v1/claims/{id}/documents/denial-pdf`
- `GET /api/v1/policies` & `GET /api/v1/policies/search`
- `GET /api/v1/settings` & `POST /api/v1/settings`
