---
name: single-feature-delivery
description: Guidelines for delivering one single feature reliably end-to-end with empirical runtime verification and minimal code churn.
---

# Single Feature Delivery Skill

## Purpose
Enforces a disciplined workflow to select, scope, implement, and empirically verify ONE single feature without introducing collateral regressions, code bloat, or architectural churn.

## Step-by-Step Workflow

### 1. Scope Definition
- Identify the exact user-facing feature to build (e.g., Cosmetics Shop Modal, Hello Kitty Territory Pattern Overlay, Donor Verification API).
- Write down the precise inputs, UI entrypoints, and expected outputs.
- Do NOT modify any unrelated modules or rewrite build systems.

### 2. Surgical Implementation
- Keep code edits minimal and local to the feature module.
- Use explicit null checks and defensive guards around browser globals (`window`, `localStorage`, `document`).
- Ensure native visual integration (standard dark theme, clear typography).

### 3. Empirical Runtime Verification
- Execute a headless or real browser session to test the feature.
- Verify:
  1. **UI Presentation**: Modal/Button renders in DOM with correct styling.
  2. **Interactivity**: Clicks, hotkeys (e.g., 'K'), and state toggles work.
  3. **Data Integrity**: API calls return expected payload (e.g. 200 OK from CBM API).
  4. **Zero Console Noise**: Intercept and resolve any runtime console errors or uncaught exceptions.

### 4. Completion Sign-Off
- Provide concrete evidence (DOM state, network response, screenshot) proving end-to-end success.
