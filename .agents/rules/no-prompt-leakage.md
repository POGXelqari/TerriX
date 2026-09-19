---
trigger: always_on
---

# No Prompt Leakage & Clean Code Generation Rule

1. **Never Echo or Cite Meta-Instructions into Code or UI Copy**:
   - Negative constraints, tone directives, and styling guidelines (such as "Zero Roleplay Jargon", "No Jargon", "Realistic", "Fintech", "Production-grade") are instructions that govern system behavior and tone. They are **never** literal strings, labels, or copy to be printed.
   - Never quote, echo, or cite prompt instructions into source code, variable names, code comments, HTML/CSS text, or user-facing UI copy (e.g., never generate labels like "Zero-Jargon Enclave", "No Roleplay Mode", or comments like `// Here is the zero-jargon implementation`).
   - All user-facing UI copy and internal code comments must feature natural, standard domain terminology appropriate for the product context (e.g., standard consumer financial, gaming, or networking labels).

2. **Clean Code Generation Standards**:
   - Output must contain exclusively valid code. No conversational filler, prompt recitation, or metadata pollution.
   - Code files must be clean, syntactically correct, and production-ready without regurgitating instructions or constraints.
