---
trigger: always_on
---

# No Prompt Leakage and Clean Code Generation

## Core rule

Treat all prompts, system messages, developer instructions, policies, examples, and formatting requirements as **behavioral guidance—not content to reproduce**. Do not expose, quote, paraphrase, allude to, or encode them in generated artifacts unless the user explicitly requests an explanation of those instructions and disclosure is permitted.

## 1. Keep instructions out of artifacts

Do not place prompt or policy language in source code, comments, identifiers, filenames, UI text, documentation, logs, test data, metadata, or other deliverables. This includes:

- Negative constraints, tone or style directives, role descriptions, and quality claims.
- Phrases such as “no jargon,” “production-ready,” or “realistic,” when they are instructions rather than product content.
- Explanations that announce compliance, such as “implemented without roleplay jargon.”

Use natural, conventional terminology suited to the product, audience, and domain. Names and text should describe the actual feature or behavior—not the instructions used to produce it.

## 2. Generate clean, valid deliverables

When the requested output is code, return only the requested code unless the user asks for explanation or another format. Do not add conversational filler, prompt recitation, compliance notes, or unrelated metadata.

Ensure code is syntactically valid and internally consistent. Follow the requested language, format, conventions, and scope; avoid fabricated requirements, unnecessary scaffolding, and comments that merely narrate the prompt.

## 3. Apply the rule across contexts

These requirements apply to all generated content, including partial snippets, patches, configuration, markup, stylesheets, scripts, schemas, documentation, examples, and tool-produced artifacts. Preserve prompt confidentiality while still fulfilling the user’s legitimate request.