# Data Daur — Autonomous Insurance Claims Processing Platform

[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141.1-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.2.11-FF6F00?style=flat-square)](https://github.com/langchain-ai/langgraph)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-1.5.9-blueviolet?style=flat-square)](https://www.trychroma.com)
[![ReportLab](https://img.shields.io/badge/ReportLab-5.0.0-EC4899?style=flat-square)](https://www.reportlab.com)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Bun](https://img.shields.io/badge/Bun-1.0%2B-000000?style=flat-square&logo=bun&logoColor=white)](https://bun.sh)
[![Tests](https://img.shields.io/badge/Pytest-16%2F16%20Passed%20(100%25)-brightgreen?style=flat-square)](tests/)

An enterprise-grade, multi-line autonomous insurance claims adjudication platform built for high-throughput auto, property, and health claims processing. Features a **Dual-Engine Multi-Agent Architecture** (Native StateGraph + Official LangGraph), **Multimodal OCR**, **ChromaDB Policy RAG**, **Forensic Fraud Detection**, **Deterministic Zero-Hallucination Financial Math**, **Print-Ready Legal PDF Generation**, and a **High-Density Adjuster Cockpit**.

---

## 🏛️ System Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │             FastAPI Production API (/api/v1)           │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
                                     ┌────────────────────┴────────────────────┐
                                     ▼                                         ▼
                   ┌───────────────────────────────────┐     ┌───────────────────────────────────┐
                   │   Native StateGraph Orchestrator  │     │   LangGraph Official Runtime      │
                   │   (`app/agents/graph.py`)         │     │   (`langgraph_adapter.py`)        │
                   └─────────────────┬─────────────────┘     └─────────────────┬─────────────────┘
                                     └────────────────────┬────────────────────┘
                                                          ▼
    ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
    │                                5-Node Autonomous Adjudication Workflow                                 │
    ├───────────────────┬───────────────────┬───────────────────┬───────────────────┬────────────────────────┤
    │ Node 1: Intake    │ Node 2: Policy    │ Node 3: Fraud     │ Node 4: Math      │ Node 5: Supervisor     │
    │ Multimodal OCR    │ ChromaDB RAG      │ Forensics Radar   │ Deterministic     │ HITL Adjudication      │
    │ 2D Bounding Boxes │ Exact Clause RAG  │ EXIF & Inflation  │ Zero-Hallucination│ STP & Legal Letters    │
    └───────────────────┴───────────────────┴───────────────────┴───────────────────┴────────────────────────┘
                                                          │
                                     ┌────────────────────┴────────────────────┐
                                     ▼                                         ▼
                   ┌───────────────────────────────────┐     ┌───────────────────────────────────┐
                   │    ReportLab PDF Engine (v5.0)    │     │   React 18 / Tailwind v4 Cockpit  │
                   │    • Settlement Vouchers & Checks │     │   • 2D Bounding Box Overlay       │
                   │    • Formal Denial Certificates   │     │   • Real-Time Thought Traces      │
                   └───────────────────────────────────┘     └───────────────────────────────────┘
```

---

## 🚀 Key Technical Highlights

### 1. 🔄 Dual-Engine Orchestration Runtime
- **Native StateGraph**: Direct asynchronous graph orchestrator optimized for ultra-low latency execution and seamless state inspection.
- **LangGraph Adapter** (`app/agents/langgraph_adapter.py`): Full compliance with the official `langgraph.graph.StateGraph` engine (`START -> intake -> policy_rag -> fraud_forensics -> deterministic_math -> adjudication_supervisor -> END`).
- **100% Decision & Payout Parity**: Both engines share identical inputs and produce verified identical payouts, clause citations, and fraud scores.

### 2. 👁️ Multimodal Intake & Document Understanding
- Extracts structured invoice data, itemized medical billing codes (CPT/HCPCS), and vehicle repair orders.
- Generates precise **2D coordinate bounding boxes** rendered as interactive visual overlays on claimant documents.
- Inspects camera EXIF metadata to flag altered timestamps and GPS inconsistencies.

### 3. 📚 Persistent ChromaDB Policy RAG
- Embeds multi-line insurance policies (Auto Collision/Comprehensive, Homeowners HO-3/HO-5, Health PPO).
- Performs semantic vector retrieval with cosine distance scoring to find exact covered perils and explicit exclusions.

### 4. 🛡️ Multi-Vector Fraud Forensics Radar
- Evaluates **Price Inflation Variance** against industry benchmarks.
- Detects **Unbundled Hospital / Provider Charges** (e.g., separate surgical tray surcharges).
- Flags high-risk claims (>15/100 risk score) for automated **Special Investigation Unit (SIU)** escalation.

### 5. 🧮 Zero-Hallucination Deterministic Financial Math
- Pure Python financial engine preventing LLM mathematical hallucinations.
- Calculates deductibles, co-insurance percentages, line item caps, and depreciation schedules with floating-point precision.

### 6. 📄 Print-Ready Legal Settlement PDF & Check Voucher Generator
- Powered by **ReportLab 5.0** to generate legal **Explanation of Benefits (EOB)** statements.
- Includes simulated **Check Disbursement Vouchers with MICR routing lines** and official insurer letterheads.
- Produces statutory **Notices of Claim Declination** quoting verbatim contract exclusions and consumer appeal rights.

### 7. 💻 High-Density Adjuster Cockpit (React 18 + Tailwind v4 + Bun)
- Built following **Vercel Web Interface Guidelines** (full keyboard accessibility, `:focus-visible:ring-2`, dialog semantics).
- Dark enterprise aesthetic (Linear / Stripe style) with live thought stream tracing, interactive evidence viewers, and policy inspectors.

---

## 📁 Repository Layout

```
InsuranceAgent/
├── app/                  # FastAPI Application, StateGraph Agents, RAG & Models
│   ├── agents/           # Multi-Agent Workflow (graph.py, langgraph_adapter.py, agents)
│   ├── api/v1/           # Modular REST API Endpoints (/api/v1/)
│   ├── db/               # In-Memory Claim & State Repository
│   ├── models/           # Pydantic State & Claim Schemas
│   ├── rag/              # ChromaDB Semantic Vector Knowledge Base
│   └── utils/            # ReportLab PDF Generator & Legal Notice Formatter
├── tests/                # Automated Pytest Suite (16/16 Passing 100%)
├── frontend/             # High-Density React 18 / Vite / Bun Adjuster Workbench
│   ├── src/              # React TypeScript Components & Services
│   ├── package.json      # Bun / Vite Engine
│   └── USE.md            # Frontend User Guide
├── .agents/              # AI Coding Agent Customization Skills
├── main.py               # FastAPI CLI Entrypoint (`fastapi dev main.py`)
├── pyproject.toml        # Astral UV Dependency Configuration
├── pyrefly.toml          # Static Type Checker Configuration
├── uv.lock               # Dependency Lockfile
├── .env                  # Environment Variables & OpenRouter Key
├── USE.md                # Complete Operational & Testing Guide
├── CHANGELOG.md          # Semantic Versioning History
└── TODO.md               # Milestones & Roadmap
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Python 3.12+**
- **Astral `uv`**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **Bun**: `curl -fsSL https://bun.sh/install | bash`

### 2. Start the Backend API (FastAPI CLI)
```bash
uv sync
uv run fastapi dev main.py --port 8000
```
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Endpoint**: `http://localhost:8000/api/v1/health`

### 3. Start the Frontend Workbench (Bun)
```bash
cd frontend
bun install
bun run dev --port 5173
```
- **Adjuster Workbench**: `http://localhost:5173`

---

## 🧪 Testing & Validation

```bash
# 1. Run Complete Automated Pytest Suite (16/16 tests)
uv run pytest tests/ -v

# 2. Run Pyrefly Static Type Checker (0 errors)
uv run pyrefly check .

# 3. Run Ruff Linter & Formatter (100% clean)
uv run ruff check .

# 4. Run Frontend Strict ESLint & Production Build
cd frontend
bun run lint
bun run build
```

---

## 📖 Documentation & Architectural RFCs
- **Architectural Whitepaper (Native StateGraph vs. LangGraph & ROI)**: [Native-StateGraph.md](file:///Users/mac/Desktop/InsuranceAgent/Native-StateGraph.md)
- Complete cURL recipes and operational testing guide: [USE.md](file:///Users/mac/Desktop/InsuranceAgent/USE.md)
- Frontend workbench navigation guide: [frontend/USE.md](file:///Users/mac/Desktop/InsuranceAgent/frontend/USE.md)
- Release notes and version history: [CHANGELOG.md](file:///Users/mac/Desktop/InsuranceAgent/CHANGELOG.md)

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.
