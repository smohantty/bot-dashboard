# WebSocket Event Schemas

This directory contains the authoritative JSON schema definition for the WebSocket events used by the trading bots and the dashboard.

## Purpose

The `schema.json` file serves as the **primary source of truth** for the data structure exchanged between the backend trading bots and the frontend dashboard. To ensure compatibility, language-specific type definitions should align with this schema.

## Files

- **`schema.json`**: JSON Schema definition.

## Implementation Locations

Language-specific implementations are maintained in their respective source directories:

- **Frontend (TypeScript)**: [`src/types/schema.ts`](../src/types/schema.ts)
- **Lighter Bot (Python)**: `src/strategy/types.py` (in the bot repository)

## Usage

When making changes to the event structures:
1. Update `schema.json` to define the new structure.
2. Update the frontend types in `src/types/schema.ts`.
3. Update the backend bot types in `src/strategy/types.py`.
