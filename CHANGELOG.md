# Changelog

All notable changes and architectural advancements to the **Autonomous Insurance Claims Processing Platform** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.6.0] - 2026-08-16

### Added (Option 4: Dual-Engine LangGraph Adapter)
- **Official LangGraph 1.2+ Adapter Engine** (`app/agents/langgraph_adapter.py`):
  - Compiled `langgraph.graph.StateGraph` pipeline with explicit state transitions (`START -> intake -> policy_rag -> fraud_forensics -> deterministic_math -> adjudication_supervisor -> END`).
  - Node handlers with comprehensive error-containment and thought-trace streaming telemetry.
- **REST API Multi-Engine Query Parameter**:
  - `POST /api/v1/claims/{id}/process?engine=native|langgraph`.
- **Frontend Settings Engine Switcher**:
  - Added segmented UI toggle between `Native StateGraph` and `LangGraph Official` runtime in `SettingsModal.tsx`.
- **Comprehensive Dual-Engine Parity Test Suite** (`tests/test_langgraph_adapter.py`):
  - Verified 100% mathematical, policy citation, and fraud score parity between Native and LangGraph engines.
  - Expanded total automated tests from 11 to **16 passing tests (100%)**.

---

## [1.5.0] - 2026-08-16

### Added (Option 3: Downloadable PDF Settlement Checks & EOB Packages)
- **ReportLab Enterprise PDF Generation Engine**:
  - Implemented `backend/app/utils/pdf_generator.py` with `generate_settlement_pdf` and `generate_denial_pdf`.
  - **Settlement Voucher & EOB**: Official insurer letterhead banner (*Apex Assurance & Underwriting Corp*), claim metadata, itemized loss breakdown schedule, mathematical audit calculation, and non-negotiable check disbursement stub with MICR routing simulation and security borders.
  - **Notice of Claim Declination**: Formal declination document with exact policy clause citations (e.g. *Section I Exclusion 3.a Ground Water Seepage*), factual findings, and State Insurance Commissioner statutory dispute rights disclosure.
- **Dedicated REST PDF Download Endpoints**:
  - `GET /api/v1/claims/{id}/documents/settlement-pdf`
  - `GET /api/v1/claims/{id}/documents/denial-pdf`
- **Frontend 1-Click PDF Downloads**:
  - Added "Download Official PDF" button in `LetterModal.tsx`.
  - Added direct "PDF Voucher" and "PDF Notice" shortcut download triggers on the `AdjusterWorkbench.tsx` verdict bar.
  - Added `downloadSettlementPdf` and `downloadDenialPdf` methods in `api.ts`.
- **Automated Tests**:
  - Added `backend/tests/test_pdf_generator.py` (11/11 tests passing 100%).

---

## [1.4.5] - 2026-08-16

### Enhanced & Standardized
- **Vercel Web Interface Guidelines Compliance Suite**:
  - Executed automated design guidelines audit against Web Interface Guidelines.
  - **Accessibility**: Added explicit `aria-label` tags, mapped form labels, added `aria-hidden="true"`.
  - **Semantic Controls**: Replaced `<div onClick>` with semantic `<button type="button">`.
  - **Focus Visibility**: Configured `:focus-visible:ring-2` states on all interactive elements.
  - **Typography & Formatting**: Standardized typographic ellipsis `…`, enabled `font-mono tabular-nums`.

---

## [1.4.4] - 2026-08-16

### Fixed
- **React Hook Exhaustive-Deps & ESLint Zero-Warning Suite**:
  - Wrapped `loadClaims` and `handleSelectClaim` in `useCallback` inside `frontend/src/App.tsx`.
  - Removed unused imports and variables across all components.
  - Verified `bun run lint` (ESLint) → **0 problems, 0 warnings (100% clean)**.

---

## [1.4.3] - 2026-08-16

### Fixed & Enhanced
- **100% Strict TypeScript Type Safety (Zero `any` Types)**:
  - Eliminated all loose `any`, `Record<string, any>`, and `as any` type casts across `frontend/src/types/claim.ts` and `frontend/src/services/api.ts`.

---

## [1.4.2] - 2026-08-16

### Enhanced & Cleaned
- **High-Density Minimalist UI/UX Refactoring**.

---

## [1.4.1] - 2026-08-16

### Fixed & Cleaned
- **OpenAPI / Swagger Route Deduplication**.

---

## [1.4.0] - 2026-08-16

### Added & Restructured
- **Production `/api/v1/` Modular API Architecture**.

---

## [1.3.0] - 2026-08-16

### Added & Fixed
- **Pyrefly Type Checker & IDE Linting Architecture**.

---

## [1.2.0] - 2026-08-16

### Redesigned & Enhanced
- **Enterprise-Grade UI/UX Redesign (Linear / Stripe Style)**.

---

## [1.1.0] - 2026-08-16

### Added
- **Official FastAPI CLI Integration (`fastapi dev` / `fastapi run`)**.
- **Tailwind CSS v4 Vite Engine (`@tailwindcss/vite`)**.

---

## [1.0.0] - 2026-08-16

### Initial Release: Autonomous Multi-Line Claims Adjudication Platform
