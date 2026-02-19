# WebSocket Event Schemas

The authoritative JSON Schema is maintained in the shared [bot-ws-schema](https://github.com/smohantty/bot-ws-schema) repo, included here as a git submodule at `schema/bot-ws-schema/`.

## Source of Truth

- **Schema**: `bot-ws-schema/schema/events.json` (git submodule)
- **Frontend types**: [`src/types/schema.ts`](../src/types/schema.ts) (must match the schema)

## Updating the Schema

1. Make changes in the `bot-ws-schema` repo first.
2. Update the submodule: `git submodule update --remote schema/bot-ws-schema`
3. Update `src/types/schema.ts` to match.
4. Commit the submodule pointer change and type updates together.
