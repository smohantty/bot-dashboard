# CLAUDE.md — Claude Code Project Memory

## Project Overview

Real-time trading bot dashboard for multi-exchange grid trading (Hyperliquid, Lighter, etc.). Displays live order books, metrics, positions, and activity logs via WebSocket connections. Supports multiple bot instances simultaneously through a tabbed interface.

**Author:** Antigravity (subhransu / smohantty@gmail.com)

## Tech Stack

- **React 19** (hooks-only, functional components)
- **TypeScript 5.4** (strict mode, no `any`)
- **Vite 5.2** (build tool, dev server on :5173)
- **Electron 39** (desktop packaging, Linux AppImage)
- **CSS Variables** (custom dark theme, no CSS framework)
- **Fonts:** Geist (UI) + JetBrains Mono (data/numbers)

## Quick Commands

```bash
npm run dev              # Vite dev server (http://localhost:5173)
npm run build            # tsc -b && vite build
npm run lint             # ESLint
npm run electron:dev     # Electron + Vite hot reload
npm run electron:build   # Production AppImage
```

## Critical Rules

1. **Schema sync is mandatory**: `schema/schema.json` is the single source of truth. `src/types/schema.ts` must always match it. Backend Python types must also stay in sync.
2. **No `any` types** — use proper interfaces and union types.
3. **Functional components only** with `React.FC<Props>` typing.
4. **All state comes from `useBotStore()`** — never create local WebSocket connections in components.
5. **CSS variables for all colors** — defined in `src/index.css`. Never hardcode color values.
6. **Dashboard must fit 1280x720** without scrolling the main window (internal scrolls OK).
7. **Dark mode only** — no light theme support.

## Architecture

```
Backend (Python) → WebSocket → WebSocketContext → React Components
```

- **WebSocketContext** (`src/context/WebSocketContext.tsx`): Central hub — manages WS lifecycle, parses events, normalizes data, provides via `useBotStore()` hook.
- **MultiBotLayout**: Tab system wrapping independent `WebSocketProvider` per connection.
- **No router** — tab-based navigation + modal-based connection management.
- **No Redux/Zustand** — React Context API only.

## Key Files

| File | Purpose |
|------|---------|
| `src/context/WebSocketContext.tsx` | State management + WS lifecycle |
| `src/types/schema.ts` | All TypeScript data models |
| `schema/schema.json` | API contract (source of truth) |
| `src/index.css` | Theme variables + component styles |
| `src/components/MultiBotLayout.tsx` | Tab system + connection management |
| `src/components/OrderBook.tsx` | CLOB-style order book visualization |
| `src/components/MetricsBar.tsx` | Summary metrics (spot/perp) |
| `src/utils/storage.ts` | localStorage + env var helpers |
| `electron/main.cjs` | Electron main process |

## Directory Structure

```
src/
├── main.tsx                    # React entry point
├── App.tsx                     # Root component
├── App.css                     # App-specific styles
├── index.css                   # Global theme + component styles
├── components/                 # React components (10 files)
├── context/WebSocketContext.tsx # Central state management
├── types/
│   ├── schema.ts               # Data model definitions
│   └── connection.ts           # BotConnection interface
├── utils/storage.ts            # Persistence helpers
└── assets/                     # Static assets
electron/main.cjs               # Electron main process
schema/schema.json              # JSON Schema (source of truth)
```

## WebSocket Events

The app handles these event types from the backend:

- `config` → `StrategyConfig` (spot_grid | perp_grid)
- `info` → `SystemInfo` (exchange, network)
- `spot_grid_summary` / `perp_grid_summary` → Strategy metrics
- `grid_state` → `GridState` with `ZoneInfo[]` (order book data)
- `order_update` → `OrderEvent` (filled/open/cancelled)
- `market_update` → `{ price: number }`
- `error` → `string`

## Environment Variables

- `VITE_WS_PORT` — WebSocket port (default: `9000`)
- `VITE_WS_URL` — Full WebSocket URL override

## Naming Conventions

- **Components:** PascalCase files and names
- **Variables/functions:** camelCase
- **Types/Interfaces:** PascalCase
- **CSS classes:** kebab-case
- **One component per file**, no barrel exports

## Git Commit Style

Conventional Commits with optional scope:

```
fix: description
feat(ui): description
fix(schema): description
refactor(orderbook): description
```

Common scopes: `ui`, `schema`, `orderbook`, `metricsbar`, `activitylog`

## Styling Patterns

- Use CSS variables from `src/index.css` (e.g., `--bg-primary`, `--color-buy`, `--accent-primary`)
- `.card` class for glass-morphic panels
- `.badge` class with variants: `badge-buy`, `badge-sell`, `badge-neutral`, `badge-muted`, `badge-gold`
- Inline styles acceptable for component-specific customization
- Flexbox/Grid for all layouts

## Component Patterns

- Props destructured in function signature
- `useMemo` for expensive derivations (e.g., sorting asks/bids)
- `useRef` for scroll containers
- `useEffect` for WS lifecycle and side effects
- Conditional rendering with ternary operators
- Skeleton loaders while data is loading

## What's Missing (Known Gaps)

- No test suite (no Vitest/Jest configured)
- No URL validation in connection manager
- No error recovery UI (errors logged to console only)
- Manual schema sync between JSON schema and TypeScript types
