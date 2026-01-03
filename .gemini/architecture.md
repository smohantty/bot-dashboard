# Architecture Overview

## System Context
The **Trading Bot Dashboard** is an Electron-based desktop application serving as a frontend for the `lighter-trading-bot` and `hyperliquid-trading-bot` Python engines. It provides real-time visualization of market data, order placements, and strategy performance.

## Component Architecture

### 1. Electron Container (`electron/`)
- **Main Process**: `main.cjs`. Handles window creation, lifecycle, and strictly limited IPC.
- **Renderer**: The Vite-built React application.

### 2. Frontend Core (`src/`)
- **App Entry**: `main.tsx` -> `App.tsx`.
- **Layouts**:
  - `MultiBotLayout`: Top-level tab system to switch between bot ports (e.g., 9000 vs 9001).
  - `Layout`: Main dashboard grid structure (Header, Main Content, Footer).

### 3. Data Layer (`src/context/`)
- **WebSocketContext**: The heart of the application.
  - Manages `WebSocket` connection.
  - Handles auto-reconnect logic.
  - Deserializes JSON events (Config, Summary, OrderUpdate, etc.).
  - Maintains `BotStore` state object.
  - exposes `useBotStore()` hook for components to consume data.

### 4. UI Components (`src/components/`)
- **MetricsBar**: 2-row consolidated status header (PnL, Prices, Balances).
- **OrderBook**: Visualizes the Grid strategy.
  - Renders `asks` and `bids` relative to current price.
  - Shows active grid lines and spread.
  - **Logic**: derived from `GridState` event.
- **ActivityLog**: Real-time list of `OrderUpdate` events.
- **ConfigPanel**: Read-only display of strategy parameters (`StrategyConfig`).

## Data Flow
1. **Backend** emits JSON events via WebSocket (localhost:9000+).
   - `config`: Strategy settings.
   - `spot_grid_summary` / `perp_grid_summary`: Performance stats.
   - `grid_state`: Full orderbook/grid snapshot.
   - `order_update`: Individual order lifecycle events.
2. **Frontend** receives events in `WebSocketContext`.
3. **State Updates**: React state updates trigger re-renders of subscribed components.

## Theming System
- **CSS Variables**: All colors are abstracted in `src/index.css`.
- **Logic**: No hardcoded hex values in components. Use `var(--color-buy)`, `var(--bg-primary)`, etc. to allow for easy theming adjustments.

## File Structure
```
/
├── electron/           # Electron main process
├── schema/             # JSON Schema for WS API
├── src/
│   ├── components/     # UI Components
│   ├── context/        # State & WS Logic
│   ├── types/          # TS Interfaces
│   ├── App.tsx         # Root component
│   └── index.css       # Global styles & variables
└── package.json        # Dependencies & Build scripts
```
