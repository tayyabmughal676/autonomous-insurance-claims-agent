# Frontend User & Adjuster Workbench Guide (`USE.md`)

Data Daur — High-Density Enterprise Insurance Adjudication Workbench

---

## 1. Quickstart & Launch

### Prerequisites
- **Bun** (https://bun.sh) or **Node.js 18+**

### Installation & Launch
From `frontend/` directory:
```bash
cd frontend
bun install
bun run dev --port 5173
```
- Open in browser: `http://localhost:5173`

---

## 2. Code Quality & Build Verification

```bash
# 1. Run Strict ESLint Check (0 warnings allowed)
bun run lint

# 2. Compile TypeScript & Build Production Bundle
bun run build
```

---

## 3. Adjuster Workbench Overview & Key Features

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Navbar: [Data Daur] [All|Auto|Property|Health] [SANDBOX|PROD] [⚙ Settings]       │
├──────────────────────────┬──────────────────────────────────────────────────────┤
│ Claims Queue             │ Adjuster Command Cockpit                             │
│ ──────────────────────── │ ───────────────────────────────────────────────────  │
│ [🔍 Search Claims...   ] │ Header: Claim Number, Claimant, Loss Amount          │
│ [All] [STP] [Review]     │ [✨ Run AI Pipeline] [✓ Approve] [✕ Decline] [? RFI]  │
│ ──────────────────────── │ ───────────────────────────────────────────────────  │
│ CLM-2026-AUTO-0811 (STP) │ Adjudication Verdict Banner (Confidence & Summary)   │
│ Marcus Vance | $1,450.00 │ ───────────────────────────────────────────────────  │
│                          │ Tabs: [Audit Trace] [Evidence & OCR] [Policy RAG]    │
│ CLM-2026-PROP-0730 (Deny)│       [Fraud Radar] [Financial Schedule]             │
│ Elena Rostova | $8,850.00│                                                      │
└──────────────────────────┴──────────────────────────────────────────────────────┘
```

---

## 4. Step-by-Step Scenario Testing Walkthrough

### Scenario 1: Auto Collision Straight-Through Processing (STP)
1. Select **`CLM-2026-AUTO-0811`** (Marcus Vance, $1,450.00) from the queue.
2. Click **`Run AI Pipeline`**:
   - The 5-node StateGraph executes in real-time.
   - **Audit Trace**: Review millisecond timings (`duration_ms`), OCR entity matches, and thought streams.
   - **Evidence & OCR Tab**: Inspect the 2D bounding boxes on the repair estimate invoice.
   - **Financial Schedule Tab**: Verify the deterministic calculation:
     `$1,450.00 (Claimed) - $500.00 (Deductible) = $950.00 (Disbursable)`
3. Click **`Settlement Letter`** in the verdict banner to view and copy the formal legal markdown Settlement Voucher.

---

### Scenario 2: Property Loss with Ground Water Exclusion & EXIF Tampering
1. Select **`CLM-2026-PROP-0730`** (Elena Rostova, $8,850.00).
2. Click **`Run AI Pipeline`**:
   - **Verdict**: `RECOMMEND_DENIAL` with **100/100 Multi-Vector Risk Score**.
   - **Fraud Radar Tab**: Detects `FRD-EXIF-001` (Damage photo EXIF timestamp was taken 47 days before claimed loss date) → Flags mandatory **SIU Referral**.
   - **Policy Clauses Tab**: Queries ChromaDB vector store and identifies **Section I Exclusion 3.a** (Subsurface ground water foundation seepage).
   - **Financial Schedule Tab**: All line items marked as disallowed with net payout **$0.00**.
3. Click **`Denial Notice`** to preview the compliant legal declination letter citing Section I Exclusion 3.a.

---

### Scenario 3: Health Care CPT Benchmark Audit & Co-Insurance
1. Select **`CLM-2026-HLTH-0729`** (David Chen, $4,750.00).
2. Click **`Run AI Pipeline`**:
   - **Verdict**: `ESCALATE_TO_ADJUSTER`.
   - **Financial Schedule Tab**:
     - ER Visit CPT-99285 adjusted from $1,400 to fee benchmark $850.
     - CT Scan CPT-74176 adjusted from $950 to fee benchmark $750.
     - Unbundled tray fee $600 disallowed under Section 11.a.
     - Co-insurance applied at 20% after $1,000 deductible.
     - Final net payout calculated to **$1,880.00**.
3. Adjust allowed amounts or toggle line items directly in the table to test live recalculation.
4. Click **`Approve`** to record human adjuster sign-off.

---

### Scenario 4: Ingest a Custom Claim
1. Click **`+ Intake Claim`** in the top navigation bar.
2. Choose a preset (**Auto Collision**, **Property Loss**, or **Health PPO**) or enter custom claimant details, incident dates, and amounts.
3. Click **`Ingest & Process Claim`**.
4. The claim is immediately added to the queue and processed through the StateGraph pipeline.

---

## 5. System Settings & Custom OpenRouter Key

1. Click the **⚙ (Gear icon)** in the top right corner.
2. Enter your custom **OpenRouter API Key** (`sk-or-v1-...`).
3. Select preferred models:
   - **Reasoning Model**: `openai/gpt-oss-20b:free`, `google/gemini-2.0-flash-exp:free`, `anthropic/claude-3.7-sonnet`.
   - **Vision Model**: `google/gemini-2.0-flash-exp:free`, `google/gemini-2.5-flash`.
4. Adjust autonomous **STP Guardrails** (e.g. maximum auto-approval limit and fraud score threshold).
5. Click **`Save Settings`**.
