import React, { type ReactNode } from 'react';
import { useBotStore } from '../context/WebSocketContext';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { systemInfo } = useBotStore();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 32px',
                height: '60px',
                background: 'rgba(8, 12, 18, 0.85)',
                backdropFilter: 'blur(24px) saturate(180%)',
                borderBottom: '1px solid var(--border-subtle)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                animation: 'fadeIn 0.5s ease-out'
            }}>
                {/* Subtle gradient line at bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%)',
                    opacity: 0.3
                }} />

                {/* Left: Logo & Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Logo Icon - Enhanced grid pattern */}
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, rgba(0, 245, 212, 0.5) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 24px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Inner glow effect */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 50%)',
                                pointerEvents: 'none'
                            }} />
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#000', position: 'relative', zIndex: 1 }}>
                                <path d="M3 3h7v7H3V3z" fill="currentColor" />
                                <path d="M14 3h7v7h-7V3z" fill="currentColor" opacity="0.7" />
                                <path d="M3 14h7v7H3v-7z" fill="currentColor" opacity="0.7" />
                                <path d="M14 14h7v7h-7v-7z" fill="currentColor" opacity="0.4" />
                            </svg>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <span style={{
                                fontSize: '16px',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.03em',
                                lineHeight: 1.2
                            }}>
                                GridBot
                            </span>
                            <span style={{
                                fontSize: '10px',
                                color: 'var(--text-tertiary)',
                                letterSpacing: '0.8px',
                                textTransform: 'uppercase',
                                fontWeight: 500
                            }}>
                                {systemInfo?.exchange || 'TRADING BOT'}
                            </span>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav style={{ display: 'flex', gap: '4px' }}>
                        <NavItem label="Dashboard" active />
                        <NavItem label="Analytics" />
                        <NavItem label="Settings" />
                    </nav>
                </div>

                {/* Right: Network indicator */}
                {systemInfo && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: systemInfo.network === 'mainnet'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(168, 85, 247, 0.1)',
                        border: `1px solid ${systemInfo.network === 'mainnet'
                            ? 'rgba(34, 197, 94, 0.25)'
                            : 'rgba(168, 85, 247, 0.25)'}`,
                    }}>
                        <div style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: systemInfo.network === 'mainnet'
                                ? 'var(--color-buy)'
                                : 'var(--accent-purple)',
                            boxShadow: systemInfo.network === 'mainnet'
                                ? '0 0 8px var(--color-buy-glow)'
                                : '0 0 8px var(--accent-purple-glow)'
                        }} />
                        <span style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.5px',
                            color: systemInfo.network === 'mainnet'
                                ? 'var(--color-buy-bright)'
                                : 'var(--accent-purple)',
                            textTransform: 'uppercase'
                        }}>
                            {systemInfo.network}
                        </span>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main style={{
                flex: 1,
                padding: '32px 36px',
                maxWidth: '1560px',
                width: '100%',
                margin: '0 auto'
            }}>
                {children}
            </main>
        </div>
    );
};

const NavItem: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <button
            style={{
                background: active ? 'rgba(0, 245, 212, 0.08)' : isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 500,
                color: active ? 'var(--accent-primary)' : isHovered ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                position: 'relative',
                fontFamily: 'inherit'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label}
            {active && (
                <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '24px',
                    height: '2px',
                    background: 'var(--accent-primary)',
                    borderRadius: '2px',
                    boxShadow: '0 0 12px var(--accent-glow)'
                }} />
            )}
        </button>
    );
};

export default Layout;
