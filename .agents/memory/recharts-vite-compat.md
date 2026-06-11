---
name: Recharts v3 + Vite 8 incompatibility
description: recharts v3 pulls in es-toolkit which has a CJS/ESM conflict that crashes Vite 8 dev server at runtime.
---

**Rule:** Use recharts v2 (e.g. 2.15.0) in this project. Do not upgrade to v3.

**Why:** recharts v3 depends on `es-toolkit/compat` for lodash-compatible utilities. When Vite 8 pre-bundles it, the CJS wrapper emits `require_isUnsafeProperty` calls that fail at runtime with `TypeError: require_isUnsafeProperty is not a function`. Adding `optimizeDeps.include: ['recharts']` did not resolve it.

**How to apply:** If recharts charts stop working or show a blank app, check the recharts version first. Pin to `"recharts": "2.x"` in package.json.
