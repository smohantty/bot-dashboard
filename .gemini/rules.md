# Development Rules

## 1. Schema Consistency
- **Rule**: The `schema/schema.json` file is the Source of Truth.
- **Action**: Whenever a new data field is added to the backend broadcast:
  1. Add it to `schema/schema.json`.
  2. Update `src/types/schema.ts` to match.
  3. Implement in UI.

## 2. Component Design
- **Compactness**: The dashboard is information-dense. Avoid large paddings (use 4px-12px).
- **Typography**: Use standard font sizes (10px - 14px for data). Use `var(--font-mono)` for all numbers.
- **Colors**:
  - Positive/Buy: `var(--color-buy)`
  - Negative/Sell: `var(--color-sell)`
  - Neutral/Info: `var(--accent-primary)`

## 3. Performance
- **Re-renders**: `OrderBook` receives frequent updates. Ensure memoization (`useMemo`) is used for heavy calculations like sorting zones.
- **Layout Shift**: Use fixed widths (or `min-width`) for numeric columns to prevent jitter when digits change.

## 4. Electron & Build
- **Relative Paths**: Use `./` for local imports.
- **IPC**: Avoid adding IPC channels unless absolutely necessary (e.g., system dialogs). Prefer WebSocket for data.

## 5. Artifacts
- **Screenshots**: When making visual changes, describe the visual outcome clearly to the user since they cannot see it directly.
