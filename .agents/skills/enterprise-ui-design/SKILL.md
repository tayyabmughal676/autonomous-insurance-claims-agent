---
name: enterprise-ui-design
description: Enterprise UI/UX Design System Guidelines for Antigravity AI Coding Agents. Use to avoid generic AI-generated aesthetics (rainbow gradients, garish glows, cluttered badges) and build ultra-premium, production-grade enterprise interfaces (Linear, Stripe, Ramp, Retool style).
---

# Enterprise UI/UX Design System Guide for AI Coding Agents

This skill defines the visual architecture, typography, surface hierarchy, and design constraints required for all frontend components in the **Autonomous Insurance Claims Processing Platform**.

---

## 1. Core Visual Principles: Anti-"AI Slop" Rules

### ❌ What to AVOID (The "AI Slop" Anti-Patterns):
1. **No Rainbow Gradients**: Never use `bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500` or random neon borders.
2. **No Excessive Glows**: Do not apply aggressive box-shadow glows (`glow-blue`, `glow-red`) unless indicating an urgent critical operational alert.
3. **No Overloaded Emoji / Sparkle Spam**: Use purposeful Lucide outline icons (`Shield`, `FileText`, `CheckCircle2`, `Calculator`, `Cpu`). Avoid gratuitous sparkles on every component.
4. **No Low-Density Padding**: Enterprise tools require clean, high data density (compact table rows, 11px/12px metadata labels, clean dividers).
5. **No Ad-Hoc Color Palettes**: Use strict semantic tokens defined below.

---

## 2. Enterprise Color System

| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#090B10` | Primary application canvas |
| **Surface Level 1** | `#0E121A` | Main navigation panels, sidebars, workbench cards |
| **Surface Level 2** | `#141824` | Table headers, secondary stat cards, active buttons |
| **Subsurface / Canvas Inset** | `#080A0E` | Code blocks, terminal logs, input fields |
| **Hairline Border** | `rgba(255, 255, 255, 0.08)` | Default subtle card borders |
| **Subtle Divider** | `rgba(255, 255, 255, 0.04)` | Table row dividers, list separators |
| **Primary Accent** | `#2563EB` / `#3B82F6` | Primary action buttons, active tab indicators, focus rings |
| **Success Semantic** | `emerald-400` (`#34D399`) | Straight-Through Processing (STP) Approved, Verified EXIF |
| **Warning Semantic** | `amber-400` (`#FBBF24`) | Review Queue, Benchmark Inflation, Moderate Risk |
| **Danger Semantic** | `rose-400` (`#F87171`) | Policy Exclusions, Declination, Forensic Tampering Alerts |

---

## 3. Typography & Information Hierarchy

- **Display & Headings**: `font-display` (`Plus Jakarta Sans`, `Inter`) — `-0.02em` letter spacing, weights `600` / `700`.
- **Body UI**: `font-sans` (`Inter`) — weights `400` / `500`.
- **Numbers, Codes, Currencies, Dates**: `font-mono` (`JetBrains Mono`) — ensure all financial calculations, policy codes, claim numbers, and latency benchmarks use monospace.

---

## 4. Component Standards

### A. Semantic Status Badges
Always use subtle tint backgrounds with matching border and semantic dot:
```tsx
// Approved / Clean STP
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> STP Approved
</span>

// In Review
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Review Queue
</span>

// Denied / Excluded
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Declined
</span>
```

### B. Action Buttons
- **Primary**: Solid blue (`bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium shadow-sm`).
- **Secondary / Ghost**: Dark neutral (`bg-[#161B26] hover:bg-[#1E2433] text-slate-300 border border-white/[0.08] rounded-lg text-xs`).
- **Semantic Action**: Subtle tinted button (`bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs`).

### C. Data Tables
- Always use `font-mono` for amounts, benchmark comparisons, and percentages.
- Right-align numeric columns.
- Subtle row hover effect (`hover:bg-[#121622]`).
