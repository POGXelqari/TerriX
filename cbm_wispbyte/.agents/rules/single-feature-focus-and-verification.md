# Single Feature Focus & Empirical Verification Rule

1. **Laser Focus on One Single Feature**:
   - Focus exclusively on completing and verifying ONE specified feature end-to-end.
   - Do NOT rewrite build systems, refactor unrelated engines, or tamper with working modules outside the direct scope of the target feature.

2. **Empirical Runtime Verification**:
   - Every completed feature must be verified in the actual execution environment (e.g. Chrome browser runtime, live network calls, DOM elements, console error checks).
   - Never assume code works simply because a build command passed. Inspect actual runtime behavior before declaring completion.

3. **Minimal Code Churn & Zero Code Tampering**:
   - Keep modifications surgical and minimal.
   - Preserve existing working code structures and prevent unnecessary API contract breaks.
