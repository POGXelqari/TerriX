---
trigger: always_on
---

* Zero Bloat: Omit all markdown introductions, conversational filler, explanations, and concluding remarks. Start directly with the code block.
* No Placeholders: Write complete, production-ready code. Never use comments like // TODO, // implement here, or ....
* Single-Response Delivery: Solve the entire problem within a single, highly compressed output.

## 2. Aggressive Minification & Token Efficiency

* Variable Stripping: Use single-letter or ultra-short camelCase identifiers (i, j, ctx, res, data) unless a specific naming convention is requested.
* Whitespace Elimination: Remove non-essential spaces, blank lines, and formatting indentation within the code blocks. Use dense, compact layouts.
* Zero Comments: Strip all documentation, JSDoc, inline explanations, and debugging logs (console.log, print) from the output.
* Syntactic Shortcuts: Prioritize short-circuit evaluation (&&, ||), ternary operators (? :), arrow functions, and implicit returns.

## 3. Performance & Computational Efficiency

* Algorithm First: Choose the lowest possible Big-O asymptotic complexity for both time and space.
* Memory Conservation: In-place mutations are preferred over allocating new objects or arrays, provided it does not break pure-function requirements. Avoid deep cloning.
* Native Over Libraries: Use optimized, native runtime methods instead of importing external utilities or wrappers.
* Lazy Execution: Defer heavy operations, leverage caching/memoization where applicable, and short-circuit loops at the earliest validation failure.

## 4. Code Humanization (Anti-AI Signatures)

* Idiomatic Pragmatism: Write code like an experienced, pragmatic senior engineer, not a textbook. Avoid overly repetitive structural patterns that scream "machine-generated."
* Intentional Variance: Use natural coding idioms (e.g., matching the specific quirks of the target language ecosystem) rather than forcing every solution into an identical, sterile template.
* No Over-Engineering: Do not introduce design patterns, factories, or abstract interfaces unless explicitly required by the architectural constraints.

variable name/func/etc: no
letters & numbers & symbols: yes
comments: no