# Operational & User Testing Guide (`USE.md`)

Data Daur — Insurance Claims Processing Agent API

---

## 1. Prerequisites & Environment Setup

### Tools Required
- **Python 3.12+**
- **Astral `uv`** package manager ([https://astral.sh/uv](https://astral.sh/uv))
- **Bun** runtime ([https://bun.sh](https://bun.sh))

### Installation
From the project root directory:
```bash
# 1. Install Backend Dependencies
uv sync

# 2. Install Frontend Dependencies
cd frontend
bun install
cd ..
```

---

## 2. Launching the Services

### A. Launch Backend API (FastAPI CLI)
From the project root directory:
```bash
uv run fastapi dev main.py --port 8000
```
- **Base URL**: `http://localhost:8000`
- **Interactive OpenAPI (Swagger) Docs**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:8000/api/v1/health`

### B. Launch Frontend Workbench (Bun / Vite)
From `frontend/` directory:
```bash
cd frontend
bun run dev --port 5173
```
- **Adjuster Workbench**: `http://localhost:5173`

---

## 3. Running Automated Tests & Code Quality Checks

```bash
# 1. Run Backend Pytest Suite (11/11 tests)
uv run pytest tests/ -v

# 2. Run Pyrefly Static Type Checker (0 errors)
uv run pyrefly check .

# 3. Run Ruff Linter & Formatter (All checks passed)
uv run ruff check .

# 4. Run Frontend ESLint & Build
cd frontend
bun run lint
bun run build
cd ..
```

---

## 4. End-to-End API Testing with cURL

### A. Health & System Check
```bash
curl -s http://localhost:8000/api/v1/health | jq .
```
*Expected Response:* `status: "healthy"`, `api_version: "v1"`.

---

### B. Reset & Seed Evaluation Scenarios
```bash
curl -s -X POST http://localhost:8000/api/v1/seed | jq .
```
Seeds 4 realistic multi-line claims and indexes policy contracts into ChromaDB.

---

### C. List All Seed Scenarios
```bash
curl -s http://localhost:8000/api/v1/seed/scenarios | jq .
```

---

### D. Execute Multi-Agent Pipeline (Dual-Engine: Native vs. LangGraph)

You can execute the pipeline using either the **Native StateGraph** or the official **LangGraph** engine:

#### 1. Auto Collision Straight-Through Processing (STP) Scenario
```bash
# Option A: Native StateGraph Execution
curl -s -X POST "http://localhost:8000/api/v1/claims/clm-auto-001/process?engine=native" | jq .

# Option B: Official LangGraph Runtime Execution
curl -s -X POST "http://localhost:8000/api/v1/claims/clm-auto-001/process?engine=langgraph" | jq .
```
- **Expected Outcome**: `AUTO_APPROVE` (Confidence: 98%, Net Payout: $950.00).
- **Execution**: 5 nodes executed (`intake`, `policy_rag`, `fraud_forensics`, `deterministic_math`, `adjudication_supervisor`).
- **Parity**: Both engines produce identical payouts and decision trees.

#### 2. Property Seepage & EXIF Timestamp Tampering Scenario
```bash
curl -s -X POST "http://localhost:8000/api/v1/claims/clm-prop-002/process?engine=langgraph" | jq .
```
- **Expected Outcome**: `RECOMMEND_DENIAL` (Risk Score: 100/100, SIU Referral: `true`, Net Payout: $0.00).
- **Detected Exclusions**: `Section I - Exclusion 3.a (Ground Water Seepage & Foundation Ingress)`.

#### 3. Health Emergency Care CPT Fee Schedule Audit Scenario
```bash
curl -s -X POST http://localhost:8000/api/v1/claims/clm-hlth-003/process | jq .
```
- **Expected Outcome**: `ESCALATE_TO_ADJUSTER` (Fee variance capping + unbundled tray fee disallowance + 20% co-insurance calculation).

---

### E. Semantic Policy Vector Search (ChromaDB RAG)
```bash
curl -s "http://localhost:8000/api/v1/policies/search?q=water%20seepage&policy_id=POL-PROP-HO3-002" | jq .
```
Returns relevant policy clauses ranked by Cosine Similarity.

---

### F. Human Adjuster Adjudication Sign-Off
```bash
curl -s -X POST http://localhost:8000/api/v1/claims/clm-auto-001/adjudicate \
  -H "Content-Type: application/json" \
  -d '{
    "action": "APPROVE",
    "adjuster_notes": "Reviewed damage photo EXIF and verified body shop invoice."
  }' | jq .
```
Generates a formal legal Settlement Voucher and Explanation of Benefits (EOB).

---

### G. Download Legal PDF Documents
```bash
# 1. Download Print-Ready Settlement Voucher & Check Stub PDF
curl -s http://localhost:8000/api/v1/claims/clm-auto-001/documents/settlement-pdf -o settlement_voucher.pdf

# 2. Download Notice of Claim Declination PDF
curl -s http://localhost:8000/api/v1/claims/clm-prop-002/documents/denial-pdf -o denial_notice.pdf
```

---

## 5. Configuration & OpenRouter Models

Edit `.env` in the root directory to configure live LLMs:

```env
# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Default Reasoning & Adjudication Model
DEFAULT_REASONING_MODEL=openai/gpt-oss-20b:free

# Default Multimodal Vision Model
DEFAULT_VISION_MODEL=google/gemini-2.0-flash-exp:free

# Autonomous Straight-Through Processing (STP) Thresholds
STP_MAX_CLAIM_AMOUNT=2500.00
STP_MAX_FRAUD_SCORE=15.0
STP_MIN_CONFIDENCE_SCORE=0.85
```

---

## 6. Architecture & RFC Whitepapers
- **Enterprise Solution Architecture Whitepaper (Native StateGraph vs. LangGraph & ROI Analysis)**: [Native-StateGraph.md](file:///Users/mac/Desktop/InsuranceAgent/Native-StateGraph.md)
- **Frontend Adjuster Workbench Guide**: [frontend/USE.md](file:///Users/mac/Desktop/InsuranceAgent/frontend/USE.md)
- **Version History & Changelog**: [CHANGELOG.md](file:///Users/mac/Desktop/InsuranceAgent/CHANGELOG.md)

