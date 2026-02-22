import type { BotConnection } from '../types/connection';

export const loadConnections = async (): Promise<BotConnection[]> => {
    try {
        const res = await fetch('/api/bots');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.connections ?? [];
    } catch (e) {
        console.error('Failed to load connections:', e);
        return [];
    }
};

export const saveConnections = async (connections: BotConnection[]): Promise<void> => {
    try {
        await fetch('/api/bots', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ connections }, null, 2)
        });
    } catch (e) {
        console.error('Failed to save connections:', e);
    }
};
