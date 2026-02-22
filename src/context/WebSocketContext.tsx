import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
    type StrategyConfig,
    type SpotGridSummary,
    type PerpGridSummary,
    type GridState,
    type WebSocketEvent,
    type OrderEvent,
    type SystemInfo
} from '../types/schema';

// Union type for summaries
type Summary =
    | { type: 'spot_grid'; data: SpotGridSummary }
    | { type: 'perp_grid'; data: PerpGridSummary };

interface WebSocketContextType {
    isConnected: boolean;
    config: StrategyConfig | null;
    summary: Summary | null;
    gridState: GridState | null;
    lastPrice: number | null;
    lastTickTime: number | null;
    orderHistory: OrderEvent[];
    connectionStatus: 'connecting' | 'connected' | 'disconnected';
    systemInfo: SystemInfo | null;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

/**
 * In dev mode, proxy WebSocket through Vite's dev server to avoid
 * Chrome Private Network Access restrictions (localhost → private IP blocked).
 * In production (Electron), connect directly.
 */
const getWsUrl = (botUrl: string): string => {
    if (import.meta.env.DEV) {
        const proxyBase = `ws://${window.location.host}/ws-proxy`;
        return `${proxyBase}?url=${encodeURIComponent(botUrl)}`;
    }
    return botUrl;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode; url: string }> = ({ children, url }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
    const [config, setConfig] = useState<StrategyConfig | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [gridState, setGridState] = useState<GridState | null>(null);
    const [lastPrice, setLastPrice] = useState<number | null>(null);
    const [lastTickTime, setLastTickTime] = useState<number | null>(null);
    const [orderHistory, setOrderHistory] = useState<OrderEvent[]>([]);
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);

    // Reconnect if URL changes
    useEffect(() => {
        let cleanedUp = false;
        let retryCount = 0;
        const MAX_RETRY_DELAY = 30000; // cap at 30s
        const BASE_DELAY = 2000;

        const getRetryDelay = () => Math.min(BASE_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);

        const connect = () => {
            if (cleanedUp) return;
            try {
                setConnectionStatus('connecting');
                const wsUrl = getWsUrl(url);
                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (cleanedUp) { ws.close(); return; }
                    console.log('[WS] Connected:', url);
                    retryCount = 0;
                    setIsConnected(true);
                    setConnectionStatus('connected');
                };

                ws.onclose = () => {
                    if (cleanedUp) return;
                    setIsConnected(false);
                    setConnectionStatus('disconnected');
                    const delay = getRetryDelay();
                    if (retryCount === 0) {
                        console.log('[WS] Disconnected from', url, '— reconnecting...');
                    } else {
                        console.log(`[WS] Retry #${retryCount + 1} in ${(delay / 1000).toFixed(0)}s`);
                    }
                    retryCount++;
                    reconnectTimeoutRef.current = window.setTimeout(connect, delay);
                };

                ws.onerror = () => {
                    if (cleanedUp) return;
                    // onclose always fires after onerror, so just close — no extra logging
                    ws.close();
                };

                ws.onmessage = (event) => {
                    if (cleanedUp) return;
                    try {
                        const message: WebSocketEvent = JSON.parse(event.data);

                        switch (message.event_type) {
                            case 'config':
                                // Apply default for optional grid_count
                                if (message.data.grid_count === undefined) {
                                    message.data.grid_count = 0;
                                }
                                setConfig(message.data);
                                break;
                            case 'info':
                                setSystemInfo(message.data);
                                break;
                            case 'spot_grid_summary':
                                setSummary({ type: 'spot_grid', data: message.data });
                                break;
                            case 'perp_grid_summary':
                                setSummary({ type: 'perp_grid', data: message.data });
                                break;
                            case 'grid_state':
                                setGridState(message.data);
                                break;
                            case 'market_update':
                                setLastPrice(message.data.price);
                                setLastTickTime(Date.now());
                                break;
                            case 'order_update':
                                setOrderHistory(prev => [message.data, ...prev].slice(0, 50)); // Keep last 50
                                break;
                            case 'error':
                                console.error('[WS] Bot error:', message.data);
                                break;
                        }
                    } catch (e) {
                        console.error('[WS] Failed to parse message:', e);
                    }
                };

            } catch (e) {
                console.error('[WS] Connection failed:', e);
                if (!cleanedUp) {
                    setConnectionStatus('disconnected');
                    retryCount++;
                    reconnectTimeoutRef.current = window.setTimeout(connect, getRetryDelay());
                }
            }
        };

        connect();

        return () => {
            cleanedUp = true;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [url]);

    return (
        <WebSocketContext.Provider value={{
            isConnected,
            connectionStatus,
            config,
            summary,
            gridState,
            lastPrice,
            lastTickTime,
            orderHistory,
            systemInfo
        }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useBotStore = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useBotStore must be used within a WebSocketProvider');
    }
    return context;
};
