import React, { useState, useEffect } from 'react';
import { WebSocketProvider } from '../context/WebSocketContext';
import ConnectionManager from './ConnectionManager';
import { loadConnections, saveConnections } from '../utils/storage';
import type { BotConnection } from '../types/connection';

interface MultiBotLayoutProps {
    children: React.ReactNode;
}

const MultiBotLayout: React.FC<MultiBotLayoutProps> = ({ children }) => {
    const [connections, setConnections] = useState<BotConnection[]>([]);
    const [activeTabId, setActiveTabId] = useState<string>('');
    const [showManager, setShowManager] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Initialize connections from config file
    useEffect(() => {
        loadConnections().then(conns => {
            setConnections(conns);
            if (conns.length > 0) {
                setActiveTabId(conns[0].id);
            } else {
                setShowManager(true);
            }
            setLoaded(true);
        });
    }, []);

    const handleConnectionsChange = async (newConnections: BotConnection[]) => {
        setConnections(newConnections);
        await saveConnections(newConnections);
        // If the active tab was deleted, switch to the first available or empty
        if (!newConnections.find(c => c.id === activeTabId)) {
            if (newConnections.length > 0) {
                setActiveTabId(newConnections[0].id);
            } else {
                setActiveTabId('');
            }
        }
    };

    if (!loaded) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            {/* Top Bar: Tabs + Settings */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-glass) 100%)',
                backdropFilter: 'blur(20px) saturate(160%)',
                borderBottom: '1px solid var(--border-color)',
                padding: '0 clamp(8px, 1.6vw, 12px)',
                height: '44px',
                gap: '8px',
                position: 'relative',
                boxShadow: '0 6px 18px rgba(2, 7, 16, 0.3)',
                flexShrink: 0,
                transition: 'background var(--transition-normal), border-color var(--transition-normal)'
            }}>
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%)',
                    opacity: 0.25
                }} />

                <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'auto', padding: '2px 0' }}>
                    {connections.map(conn => (
                        <button
                            key={conn.id}
                            onClick={() => setActiveTabId(conn.id)}
                            style={{
                                padding: '6px 10px',
                                background: activeTabId === conn.id
                                    ? 'linear-gradient(135deg, var(--accent-subtle) 0%, rgba(255, 255, 255, 0.02) 100%)'
                                    : 'transparent',
                                color: activeTabId === conn.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                border: activeTabId === conn.id ? '1px solid var(--border-accent)' : '1px solid transparent',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                borderRadius: '10px',
                                fontWeight: activeTabId === conn.id ? 600 : 500,
                                boxShadow: activeTabId === conn.id ? '0 0 16px var(--accent-glow)' : 'none',
                                transition: 'all var(--transition-fast)',
                                fontSize: '11px',
                                fontFamily: 'inherit',
                                letterSpacing: '-0.01em',
                                lineHeight: 1.2
                            }}
                        >
                            {conn.name}
                        </button>
                    ))}
                </div>

                <div style={{ marginLeft: '10px' }}>
                    <button
                        onClick={() => setShowManager(true)}
                        style={{
                            padding: '6px 10px',
                            background: 'var(--bg-hover)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 500,
                            fontFamily: 'inherit',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        Manage Bots
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {connections.length === 0 ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'var(--text-tertiary)'
                    }}>
                        <p>No active connections.</p>
                        <button onClick={() => setShowManager(true)} style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            background: 'var(--accent-primary)',
                            color: '#000',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 600,
                            fontFamily: 'inherit'
                        }}>Add Connection</button>
                    </div>
                ) : (
                    connections.map(conn => (
                        <div
                            key={conn.id}
                            style={{
                                display: activeTabId === conn.id ? 'block' : 'none',
                                height: '100%',
                                overflowY: 'auto'
                            }}
                        >
                            <WebSocketProvider url={conn.url}>
                                {children}
                            </WebSocketProvider>
                        </div>
                    ))
                )}
            </div>

            {/* Connection Manager Modal */}
            {showManager && (
                <ConnectionManager
                    connections={connections}
                    onClose={() => setShowManager(false)}
                    onConnectionsChange={handleConnectionsChange}
                />
            )}
        </div>
    );
};

export default MultiBotLayout;
