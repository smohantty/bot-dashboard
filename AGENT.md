# AGENT.md — Coding Agent Guidelines

This document provides procedural guidance for AI coding agents working on this codebase. For detailed project context (tech stack, architecture, key files, data types, styling reference), see **[CLAUDE.md](CLAUDE.md)**.

## Before You Start

1. **Read [CLAUDE.md](CLAUDE.md)** for full project context, key files, and conventions.
2. Read `src/types/schema.ts` to understand the data models.
3. Read `src/context/WebSocketContext.tsx` to understand state management.
4. Read `src/index.css` (the CSS variable section at the top) to understand the theme.
5. Check `schema/schema.json` if modifying any data types.

## Absolute Rules

### Schema Synchronization
- `schema/schema.json` is the **single source of truth** for all data types.
- If you change a type in `src/types/schema.ts`, you **must** update `schema/schema.json` and vice versa.
- The backend Python types (`types.py`) must also stay in sync (not in this repo but keep this in mind).

### TypeScript
- **Strict mode is enforced.** No `any`, no `@ts-ignore`.
- `noUnusedLocals` and `noUnusedParameters` are enabled — don't leave dead code.
- All shared types live in `src/types/schema.ts`. Don't define data types inline in components.
- Use `React.FC<Props>` for component typing.

### React
- **Functional components only.** No class components.
- **All global state comes from `useBotStore()` hook** (from `WebSocketContext`).
- Never create WebSocket connections inside components.
- Destructure props in function signatures.
- Use `useMemo` for derived/computed values that involve sorting or filtering.

### Styling
- **Use CSS variables** from `src/index.css`. Never hardcode colors. See [CLAUDE.md](CLAUDE.md) for the full variable reference and available CSS classes.
- The dashboard targets **1280x720 minimum** and must not scroll the main window.
- Dark mode only. Do not add light theme support.

### Architecture Constraints
- **No new state management libraries** — use React Context.
- **No routing library** — the app is single-page with tab navigation.
- **No new CSS frameworks** (no Tailwind, no styled-components) — use existing CSS variables and classes.
- Keep the dependency footprint minimal (currently only react + react-dom as production deps).

## How To Add a New Component

1. Create `src/components/YourComponent.tsx`.
2. Define a `Props` interface.
3. Use `React.FC<Props>` typing.
4. Access data via `const { config, summary, gridState, ... } = useBotStore()`.
5. Use CSS variables for colors, `.card` class for containers.
6. Import and place in the layout grid inside `Layout.tsx` or the appropriate parent.

## How To Add a New WebSocket Event Type

1. Add the type definition to `schema/schema.json`.
2. Add the corresponding TypeScript interface to `src/types/schema.ts`.
3. Add the event to the `WebSocketEvent` union type in `schema.ts`.
4. Handle the new event in `WebSocketContext.tsx` (in the `onmessage` handler).
5. Expose the new data through the `WebSocketContextType` interface.
6. Access it in components via `useBotStore()`.

## How To Add New Metrics

1. Check if the data already exists in `summary` (SpotGridSummary or PerpGridSummary).
2. If not, update the schema (see above workflow).
3. Add the display in `MetricsBar.tsx` (primary metrics bar) or create a new component.
4. Use conditional rendering for spot vs perp differences.
5. Add skeleton loader for the loading state.

## Data Flow

```
Python Backend
    ↓ WebSocket (JSON)
WebSocketContext.tsx
    ├── Parses JSON events
    ├── Discriminates by event_type
    ├── Updates React state
    └── Exposes via useBotStore()
        ↓
React Components
    ├── MetricsBar (summary numbers)
    ├── OrderBook (grid zones visualization)
    ├── ConfigPanel (strategy parameters)
    └── ActivityLog (recent orders, max 50)
```

## Common Pitfalls

1. **Forgetting schema sync** — changing `schema.ts` without updating `schema.json` (or vice versa) will cause backend/frontend type mismatches.
2. **Hardcoding colors** — always use CSS variables, not hex/rgb values.
3. **Creating local WS connections** — all WebSocket communication goes through `WebSocketContext`.
4. **Adding scrollbars to main layout** — the dashboard must fit 1280x720. Use internal scroll containers if needed.
5. **Breaking the tab system** — each tab has its own `WebSocketProvider`. State is not shared between tabs.
6. **Enum case sensitivity** — enums like `grid_bias` use lowercase (`'long'`, `'short'`), not title case. Always compare lowercase.
7. **Order history cap** — limited to 50 entries. Don't rely on full history being available.

## Git Conventions

- Use **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`
- Include scope when relevant: `feat(ui):`, `fix(schema):`, `refactor(orderbook):`
- Keep messages concise (1-2 lines).

## Testing

No test suite is currently configured. If adding tests:
- Use **Vitest** (already compatible with Vite).
- Place test files adjacent to source: `Component.test.tsx`.
- Mock `useBotStore()` for component tests.
