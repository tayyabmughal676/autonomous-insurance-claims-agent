# Project Roadmap & Task Tracker (TODO.md)

Data Daur — Autonomous Multi-Agent Insurance Claims Adjudication Platform

---

## 🟢 Completed Milestones (v1.0.0 - v1.5.0)

### 1. Multi-Agent StateGraph Architecture
- [x] Multimodal Intake & OCR Agent with 2D Bounding Box anchors (`intake_agent.py`)
- [x] EXIF Camera Forensics & Tampering Detection Engine (`exif_analyzer.py`)
- [x] ChromaDB Persistent Vector Knowledge Base for Policy RAG (`policy_store.py`)
- [x] Multi-Vector Fraud Forensics & SIU Referral Agent (`fraud_agent.py`)
- [x] Zero-Hallucination Deterministic Financial Math Engine (`math_engine.py`)
- [x] Adjudication Supervisor Agent with STP Rule Engine ($2,500 ceiling, risk score < 15) (`adjudication_agent.py`)
- [x] Master StateGraph Orchestrator with timing metrics & thought tracing (`graph.py`)

### 2. Enterprise PDF Document Generation (Option 3 Completed)
- [x] ReportLab Enterprise PDF generation engine (`app/utils/pdf_generator.py`)
- [x] Print-ready Settlement Vouchers & Check Stubs with MICR routing simulation and high-contrast table headers
- [x] Formal Notices of Claim Declination with verbatim policy clause citations and statutory dispute rights
- [x] REST PDF download endpoints (`GET /api/v1/claims/{id}/documents/settlement-pdf` and `GET /api/v1/claims/{id}/documents/denial-pdf`)
- [x] Frontend 1-click download actions in `LetterModal.tsx` and `AdjusterWorkbench.tsx`
- [x] Pytest suite covering PDF generator binary validation and API streaming responses (`test_pdf_generator.py`)

### 3. Unified Root Architecture & Brand Identity
- [x] Promoted backend to root workspace and nested `frontend/` cleanly as the client workbench
- [x] Complete brand identity alignment to **Data Daur** across backend API, OpenAPI Docs, UI, and legal letters
- [x] Unified `USE.md` operational guide and updated quickstarts in `README.md`
- [x] Astral `uv` project structure with FastAPI CLI runner (`fastapi dev main.py`)
- [x] Pyrefly type checking (0 errors across codebase)
- [x] Ruff linting and formatting (All checks passed)
- [x] Full integration test suite passing 100% (11/11 tests)

### 4. Enterprise UI/UX & Adjuster Workbench
- [x] Linear / Stripe Dark Enterprise Design System (Anti-AI Slop principles)
- [x] Vercel Web Interface Guidelines accessibility compliance (ARIA labels, `:focus-visible:ring-2`, dialog semantics)
- [x] Environment Switcher: **Sandbox (Seeds)** vs. **Production (Live)**
- [x] Multi-Line Filter: Auto Collision, Property HO-3, and Health PPO
- [x] Interactive 2D Bounding Box Evidence Viewer (`DocumentViewer.tsx`)
- [x] Policy RAG Clause Inspector with live vector query (`PolicyInspector.tsx`)
- [x] Multi-Vector Fraud Radar & Anomaly breakdown (`FraudRadar.tsx`)
- [x] Itemized Financial Calculation Schedule with editable adjustments (`PayoutCalculator.tsx`)
- [x] 5-Node Agent Execution Trace Timeline (`AgentTrace.tsx`)
- [x] Strict 100% TypeScript type safety (0 `any` types) & 0 ESLint warnings

### 5. LLM & OpenRouter Integration
- [x] AsyncOpenAI client targeting OpenRouter API (`https://openrouter.ai/api/v1`)
- [x] Free model support: `"openai/gpt-oss-20b:free"`, `"google/gemini-2.0-flash-exp:free"`, `"meta-llama/llama-3.3-70b-instruct:free"`
- [x] Paid model presets: `"google/gemini-2.5-flash"`, `"anthropic/claude-3.7-sonnet"`
- [x] Fallback offline simulation mode when operating without keys
- [x] Dynamic runtime model and API key configuration via UI and `.env`

---

### 6. Dual-Engine LangGraph Adapter (Option 4 Completed - v1.6.0)
- [x] Added `langgraph` and `langchain-core` dependencies to `pyproject.toml`
- [x] Implemented `app/agents/langgraph_adapter.py` with compiled `langgraph.graph.StateGraph` workflow
- [x] Added multi-engine query support (`engine="native"` vs. `engine="langgraph"`) in backend API
- [x] Added interactive engine selector in `SettingsModal.tsx` and connected in `api.ts`
- [x] Created dual-engine parity test suite in `tests/test_langgraph_adapter.py` (16/16 tests passing 100%)

---

## 🟡 Immediate Next Milestones

### Milestone 1: Real-Time SSE / WebSocket Step Streaming
- [ ] Implement Server-Sent Events endpoint (`GET /api/v1/claims/{id}/stream`)
- [ ] Stream real-time node start/end events, thought tokens, and latency instrumentation to frontend
- [ ] Add animated active node pulses in `AgentTrace.tsx`

### Milestone 2: Client-Side Drag-and-Drop Real File Upload
- [ ] Support dragging and dropping real PDF / image files in `+ Intake Claim` modal
- [ ] In-browser Base64 preview rendering in `DocumentViewer.tsx`
- [ ] Client-side and server-side EXIF metadata extraction on user-uploaded photos

---

## 🔵 Future Enterprise Roadmap

- [ ] **Commercial Lines Expansion**: General Liability, Commercial Auto Fleet, and Cyber Ransomware policy schemas
- [ ] **External Database Integration**: PostgreSQL / SQLite persistent storage with SQLAlchemy 2.0
- [ ] **Identity & Role-Based Access Control (RBAC)**: Adjuster, Senior Auditor, SIU Investigator, and Compliance Officer roles
- [ ] **Analytics & Executive Dashboard**: Incurred losses vs. recoveries, STP throughput metrics, and fraud ring clustering
- [ ] **EHR / Healthcare Interoperability**: FHIR / HL7 standard intake for clinical health records
