# claude-palace

A different view into Claude Code activity. **Palace + Search**, powered by the
[claude-code-karma](https://github.com/JayantDevkar/claude-code-karma) API.

Karma does the hard backend work (JSONL indexing, SQLite, FTS5, session tracking).
This is a second frontend with its own aesthetic — memory-palace tile grid for
projects, tokenized search across renamed sessions.

## Stack

- **Turborepo** monorepo · **bun** package manager
- **React 19** + **Vite 8** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (registered in `packages/ui`)
- **TanStack Query** for data fetching · **React Router 7** for routing
- `@repo/*` shared packages (api-client, ui, shared, typescript-config)

## Layout

```
apps/
  web/                     # React frontend (this is what you run)
packages/
  api-client/              # Typed client for karma's FastAPI (@repo/api-client)
  shared/                  # Cross-package utilities (@repo/shared)
  typescript-config/       # Shared tsconfig presets (@repo/typescript-config)
  ui/                      # shadcn components + globals.css (@repo/ui)
```

## Run it

**Prerequisite:** karma's API is running on `http://localhost:8000`. From
`~/projects/claude-code-karma`:

```bash
./scripts/dev.sh   # starts API on :8000 (and karma's own Svelte UI on :5173)
```

Then from `~/projects/claude-palace`:

```bash
bun install
bun run dev
```

Open http://localhost:3001.

> Port `3001` is chosen specifically because karma's default CORS whitelist
> already allows it — no backend changes needed.

## What it does (v0)

- **Palace** (`/palace`) — Grid of project tiles, each colored from a curated
  palette via deterministic hash. Sorted by session count. Click a tile →
  filters the search to that project.
- **Search** (`/search`) — Multi-token AND search over every session's
  `session_titles`, slug, initial prompt, and UUID. Type a Linear key like
  `KEY-1273` and the matching session cards surface with project attribution.
  Uses karma's `custom-title` support (patched upstream in PR #63).

## Adding shadcn components

From the repo root:

```bash
bun run ui add button card input   # etc.
```

Components land in `packages/ui/src/components/`. Import them in apps via:

```tsx
import { Button } from "@repo/ui/components/button";
```

## Scripts

From the repo root:

- `bun run dev` — start apps/web dev server
- `bun run build` — build all packages
- `bun run check-types` — typecheck all packages

## API dependency

`@repo/api-client` wraps the subset of karma's OpenAPI we use (currently
`/projects` and `/sessions/all`). Types are hand-mirrored from
`http://localhost:8000/openapi.json`. When the client grows, swap to
`openapi-typescript` for generation.

## Future moves (not in v0)

- Absorb karma's Python API into this monorepo once the two are in lockstep
  (mentioned at scaffolding time)
- Annotations (rename sessions, pin, archive) — designed but deferred
- LLM narrative summaries ("yesterday / this week") — designed but deferred
- Live Cowork VM status indicator — deferred, fragile dep on karma's logs
- Deep-link resume handler — deferred, per-terminal fragility
