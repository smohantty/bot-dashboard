import React, { type ReactNode } from 'react';
import { useBotStore } from '../context/WebSocketContext';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { systemInfo } = useBotStore();
    const { theme, toggleTheme } = useTheme();

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
                padding: '7px clamp(8px, 1.4vw, 16px)',
                minHeight: '52px',
                height: 'auto',
                gap: '8px',
                flexWrap: 'wrap',
                background: 'linear-gradient(180deg, var(--bg-panel) 0%, var(--bg-glass) 100%)',
                backdropFilter: 'blur(24px) saturate(160%)',
                borderBottom: '1px solid var(--border-color)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                animation: 'fadeIn 0.5s ease-out',
                boxShadow: '0 10px 30px rgba(2, 7, 16, 0.45)',
                transition: 'background var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal)'
            }}>
                {/* Accent line at bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%)',
                    opacity: 0.35
                }} />

                {/* Left: Logo & Nav */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(14px, 2.4vw, 36px)',
                    flexWrap: 'wrap',
                    minWidth: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Logo Icon */}
                        <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '9px',
                            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 30px var(--accent-glow)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
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
                                letterSpacing: '0.75px',
                                textTransform: 'uppercase',
                                fontWeight: 500
                            }}>
                                {systemInfo?.exchange || 'TRADING BOT'}
                            </span>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav style={{
                        display: 'flex',
                        gap: '4px',
                        padding: '3px',
                        borderRadius: '999px',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-hover)',
                        overflowX: 'auto'
                    }}>
                        <NavItem label="Dashboard" active />
                        <NavItem label="Analytics" />
                        <NavItem label="Settings" />
                    </nav>
                </div>

                {/* Right: Theme Toggle + Network */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    {/* Theme Toggle */}
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>

                    {/* Network indicator */}
                    {systemInfo && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-sm)',
                            background: systemInfo.network === 'mainnet'
                                ? 'var(--color-buy-bg)'
                                : 'var(--accent-purple-glow)',
                            border: `1px solid ${systemInfo.network === 'mainnet'
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(79, 124, 255, 0.24)'}`,
                            boxShadow: systemInfo.network === 'mainnet'
                                ? '0 0 16px var(--color-buy-glow)'
                                : '0 0 16px var(--accent-purple-glow)',
                            transition: 'all var(--transition-normal)'
                        }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: systemInfo.network === 'mainnet'
                                    ? 'var(--color-buy)'
                                    : 'var(--accent-purple)',
                                boxShadow: systemInfo.network === 'mainnet'
                                    ? '0 0 6px var(--color-buy-glow)'
                                    : '0 0 6px var(--accent-purple-glow)'
                            }} />
                            <span style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                letterSpacing: '0.4px',
                                color: systemInfo.network === 'mainnet'
                                    ? 'var(--color-buy-bright)'
                                    : 'var(--accent-purple)',
                                textTransform: 'uppercase'
                            }}>
                                {systemInfo.network}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                flex: 1,
                padding: '10px clamp(8px, 1.5vw, 14px) 12px',
                maxWidth: '1520px',
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
                background: active
                    ? 'linear-gradient(135deg, var(--accent-subtle) 0%, rgba(255, 255, 255, 0.02) 100%)'
                    : isHovered ? 'var(--bg-card)' : 'transparent',
                border: active ? '1px solid var(--border-accent)' : '1px solid transparent',
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--accent-primary)' : isHovered ? 'var(--text-secondary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                position: 'relative',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
                boxShadow: active ? '0 0 20px var(--accent-glow)' : 'none'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {label}
        </button>
    );
};

export default Layout;
