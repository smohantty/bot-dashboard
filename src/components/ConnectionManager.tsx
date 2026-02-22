import React, { useState, useEffect } from 'react';
import type { BotConnection } from '../types/connection';
import { getStoredConnections, saveConnections } from '../utils/storage';

interface ConnectionManagerProps {
    onClose: () => void;
    onConnectionsChange: (connections: BotConnection[]) => void;
}

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ onClose, onConnectionsChange }) => {
    const [connections, setConnections] = useState<BotConnection[]>([]);
    const [newBotName, setNewBotName] = useState('');
    const [newBotUrl, setNewBotUrl] = useState('');

    useEffect(() => {
        const stored = getStoredConnections();
        setConnections(stored);
    }, []);

    const normalizeWsUrl = (url: string): string => {
        const trimmed = url.trim();
        if (trimmed.startsWith('ws://') || trimmed.startsWith('wss://')) {
            return trimmed;
        }
        return `ws://${trimmed}`;
    };

    const handleAdd = () => {
        if (!newBotName || !newBotUrl) return;
        const newConnection: BotConnection = {
            id: crypto.randomUUID(),
            name: newBotName,
            url: normalizeWsUrl(newBotUrl)
        };
        const updated = [...connections, newConnection];
        setConnections(updated);
        saveConnections(updated);
        onConnectionsChange(updated);
        setNewBotName('');
        setNewBotUrl('');
    };

    const handleDelete = (id: string) => {
        const updated = connections.filter(c => c.id !== id);
        setConnections(updated);
        saveConnections(updated);
        onConnectionsChange(updated);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--bg-overlay)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'var(--bg-modal)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                width: '550px',
                maxWidth: '90%',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '85vh',
                transition: 'background var(--transition-normal), border-color var(--transition-normal)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--border-color)',
                    background: `linear-gradient(180deg, var(--card-gradient-start) 0%, transparent 100%)`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '20px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em'
                        }}>
                            Manage Connections
                        </h2>
                        <p style={{
                            margin: '4px 0 0 0',
                            fontSize: '13px',
                            color: 'var(--text-tertiary)'
                        }}>
                            Configure your trading bot endpoints
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div style={{ padding: '24px', overflowY: 'auto' }}>
                    {/* Add New Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            color: 'var(--accent-primary)',
                            marginBottom: '16px',
                            fontWeight: 600
                        }}>
                            Add New Bot
                        </h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                                <input
                                    type="text"
                                    placeholder="Name (e.g. Lighter)"
                                    value={newBotName}
                                    onChange={e => setNewBotName(e.target.value)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="WebSocket URL (e.g. ws://localhost:9001)"
                                    value={newBotUrl}
                                    onChange={e => setNewBotUrl(e.target.value)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-primary)',
                                        fontSize: '14px',
                                        outline: 'none',
                                        fontFamily: 'var(--font-mono)'
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleAdd}
                                disabled={!newBotName || !newBotUrl}
                                style={{
                                    padding: '10px',
                                    backgroundColor: 'var(--accent-primary)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: (!newBotName || !newBotUrl) ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px var(--accent-glow)',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                Add Connection
                            </button>
                        </div>
                    </div>

                    {/* Saved List */}
                    <div>
                        <h3 style={{
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            color: 'var(--text-tertiary)',
                            marginBottom: '16px',
                            fontWeight: 600
                        }}>
                            Saved Connections
                        </h3>
                        {connections.length === 0 ? (
                            <div style={{
                                padding: '32px',
                                textAlign: 'center',
                                color: 'var(--text-tertiary)',
                                border: '1px dashed var(--border-subtle)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '14px'
                            }}>
                                No saved connections found.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {connections.map(c => (
                                    <div key={c.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: 'var(--radius-md)',
                                        transition: 'border-color 0.2s'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
                                                marginBottom: '4px'
                                            }}>
                                                {c.name}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: 'var(--text-tertiary)',
                                                fontFamily: 'var(--font-mono)'
                                            }}>
                                                {c.url}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            style={{
                                                padding: '8px 12px',
                                                background: 'var(--color-sell-bg)',
                                                color: 'var(--color-sell)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: 'var(--radius-sm)',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                transition: 'all 0.2s',
                                                fontFamily: 'inherit'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-modal-footer)',
                    textAlign: 'right',
                    transition: 'background var(--transition-normal), border-color var(--transition-normal)'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: 'var(--bg-hover)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            fontFamily: 'inherit'
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectionManager;
