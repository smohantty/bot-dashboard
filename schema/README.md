# WebSocket Event Schemas

This directory contains the authoritative schema definitions for the WebSocket events used by the trading bots and the dashboard.

## Purpose

The goal is to maintain a consistent data structure across:
- **Frontend Dashboard** (`schema.ts`): TypeScript interfaces used by the React application.
- **Hyperliquid Bot** (`types.rs`): Rust structs used by the Hyperliquid trading bot.
- **Lighter Bot** (`types.py`): Python dataclasses used by the Lighter trading bot.

## Files

- **`schema.ts`**: TypeScript definitions. This is the primary reference for the frontend.
- **`types.rs`**: Rust definitions. Ensure the Hyperliquid bot's broadcast module matches these structures.
- **`types.py`**: Python definitions. Ensure the Lighter bot's broadcast module matches these structures.

## Usage

When making changes to the event structures:
1. Update the definition in all three files to ensure compatibility.
2. Update the respective bot implementations to populate the new fields.
3. Update the frontend to consume the new fields.
