# Mizu consumer check

A minimal Vite + React app that consumes `@mizu/ui` exactly like an external
developer would — installed from the package directory, not from source.

```bash
bun install
bun run dev      # http://localhost:5173
bun run build    # typecheck + production build
```

The dependency is `"@mizu/ui": "file:../../packages/mizu"`. Installing it runs
the package's `prepare` script, which compiles `dist/` — so the package is
always built from current source.

What this verifies:

- imports and type declarations resolve from the packed layout
- `styles.css` loads and fonts bundle
- tree-shaken ESM works under Vite
- production build succeeds
