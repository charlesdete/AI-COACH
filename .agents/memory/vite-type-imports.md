---
name: TypeScript interface imports in Vite (ESM runtime)
description: TypeScript interfaces and type aliases must use `import type` or Vite's ESM runtime throws "does not provide an export named X".
---

**Rule:** All imports of TypeScript `interface` or `type` declarations must use `import type { ... }` syntax.

**Why:** TypeScript interfaces are erased at compile time and produce no runtime export. Vite's native ESM dev server evaluates modules at runtime and tries to destructure named exports — if the export doesn't exist (because it was erased), it throws `SyntaxError: The requested module '...' does not provide an export named 'X'`. This crashes the entire app.

**How to apply:** Any time you import from a file that only contains `interface` or `type` declarations (e.g. `src/shared/types/*.ts`), always write `import type { Foo } from '...'` not `import { Foo } from '...'`.
