import React from 'react';
import { useBotStore } from '../context/WebSocketContext';
import Tooltip from './Tooltip';

const SummaryCard: React.FC = () => {
    const { summary, lastTickTime, connectionStatus } = useBotStore();

    if (!summary) {
        return (
            <div className="card" style={{
                padding: '80px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                animationDelay: '0ms',
                minHeight: '400px'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--bg-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s ease-in-out infinite'
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                        <path d="M3 3h7v7H3V3z" />
                        <path d="M14 3h7v7h-7V3z" />
                        <path d="M3 14h7v7H3v-7z" />
                        <path d="M14 14h7v7h-7v-7z" />
                    </svg>
                </div>
                <div className="skeleton" style={{ width: '180px', height: '36px' }} />
                <div className="skeleton" style={{ width: '120px', height: '16px' }} />
            </div>
        );
    }

    const timeStr = lastTickTime ? new Date(lastTickTime).toLocaleTimeString() : '--:--:--';
    const isPerp = summary.type === 'perp_grid';
    const s = summary.data;

    const totalPnl = s.realized_pnl + s.unrealized_pnl - s.total_fees;
    const pnlColor = totalPnl >= 0 ? 'var(--color-buy-bright)' : 'var(--color-sell-bright)';
    const pnlGlow = totalPnl >= 0 ? 'var(--color-buy-glow)' : 'var(--color-sell-glow)';
    const pnlBg = totalPnl >= 0 ? 'rgba(34, 197, 94, 0.06)' : 'rgba(239, 68, 68, 0.06)';
    const pnlSign = totalPnl >= 0 ? '+' : '';

    if (isPerp) {
        const perpData = summary.data as typeof summary.data & {
            position_side: string;
            leverage: number;
            grid_bias: string;
            margin_balance: number;
        };

        const positionColor = perpData.position_side === 'Long' ? 'var(--color-buy-bright)' :
            perpData.position_side === 'Short' ? 'var(--color-sell-bright)' :
                'var(--text-tertiary)';

        const biasColor = perpData.grid_bias === 'Long' ? 'var(--color-buy-bright)' :
            perpData.grid_bias === 'Short' ? 'var(--color-sell-bright)' : 'var(--accent-primary)';

        const biasBg = perpData.grid_bias === 'Long' ? 'var(--color-buy-bg)' :
            perpData.grid_bias === 'Short' ? 'var(--color-sell-bg)' : 'var(--accent-subtle)';

        return (
            <div className="card" style={{
                overflow: 'hidden',
                animationDelay: '0ms'
            }}>
                {/* Header */}
                <CardHeader
                    symbol={s.symbol}
                    timeStr={timeStr}
                    connectionStatus={connectionStatus}
                    badge={{ text: perpData.grid_bias.toUpperCase(), color: biasColor, bg: biasBg }}
                    isPerp
                    leverage={perpData.leverage}
                />

                {/* Hero Price Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    borderBottom: '1px solid var(--border-color)'
                }}>
                    {/* Market Price - Hero */}
                    <PriceHero price={s.price} />

                    {/* Total PnL */}
                    <PnLDisplay
                        totalPnl={totalPnl}
                        pnlColor={pnlColor}
                        pnlGlow={pnlGlow}
                        pnlBg={pnlBg}
                        pnlSign={pnlSign}
                    />
                </div>

                {/* PnL Breakdown Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    borderBottom: '1px solid var(--border-color)'
                }}>
                    <PnLCell
                        label="Realized"
                        value={s.realized_pnl}
                        tooltip="Profit/loss from completed trades"
                    />
                    <PnLCell
                        label="Unrealized"
                        value={s.unrealized_pnl}
                        tooltip="Current position value vs entry"
                    />
                    <PnLCell
                        label="Fees Paid"
                        value={-s.total_fees}
                        showNegative
                        tooltip="Total trading fees"
                    />
                    <StatCell
                        label="Roundtrips"
                        value={s.roundtrips.toString()}
                        highlight
                        isLast
                    />
                </div>

                {/* Stats Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    borderBottom: '1px solid var(--border-color)'
                }}>
                    <StatCell
                        label="Position"
                        value={`${Math.abs(perpData.position_size).toFixed(4)}`}
                        subValue={perpData.position_side}
                        valueColor={positionColor}
                    />
                    <StatCell label="Avg Entry" value={`$${perpData.avg_entry_price.toFixed(2)}`} />
                    <StatCell
                        label="Initial Entry"
                        value={s.initial_entry_price ? `$${s.initial_entry_price.toFixed(2)}` : '--'}
                        tooltip="Entry price when strategy started"
                    />
                    <StatCell label="Margin" value={`$${perpData.margin_balance.toFixed(2)}`} isLast />
                </div>

                {/* Footer */}
                <CardFooter uptime={s.uptime} />
            </div>
        );
    }

    // Spot Grid
    const spotData = summary.data as typeof summary.data & {
        base_balance: number;
        quote_balance: number;
    };

    return (
        <div className="card" style={{
            overflow: 'hidden',
            animationDelay: '0ms'
        }}>
            {/* Header */}
            <CardHeader
                symbol={s.symbol}
                timeStr={timeStr}
                connectionStatus={connectionStatus}
                badge={{ text: 'SPOT', color: 'var(--text-secondary)', bg: 'var(--bg-hover)' }}
            />

            {/* Hero Price Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <PriceHero price={s.price} decimals={4} />
                <PnLDisplay
                    totalPnl={totalPnl}
                    pnlColor={pnlColor}
                    pnlGlow={pnlGlow}
                    pnlBg={pnlBg}
                    pnlSign={pnlSign}
                />
            </div>

            {/* PnL Breakdown Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <PnLCell label="Realized" value={s.realized_pnl} />
                <PnLCell label="Unrealized" value={s.unrealized_pnl} />
                <PnLCell label="Fees Paid" value={-s.total_fees} showNegative />
                <StatCell label="Roundtrips" value={s.roundtrips.toString()} highlight isLast />
            </div>

            {/* Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <StatCell label="Position" value={spotData.position_size.toFixed(4)} />
                <StatCell label="Avg Entry" value={`$${spotData.avg_entry_price.toFixed(4)}`} />
                <StatCell
                    label="Initial Entry"
                    value={s.initial_entry_price ? `$${s.initial_entry_price.toFixed(4)}` : '--'}
                    tooltip="Entry price when strategy started"
                />
                <StatCell label="Quote Balance" value={`$${spotData.quote_balance.toFixed(2)}`} isLast />
            </div>

            {/* Footer */}
            <CardFooter uptime={s.uptime} />
        </div>
    );
};

// Sub-components

const CardHeader: React.FC<{
    symbol: string;
    timeStr: string;
    connectionStatus: 'connected' | 'connecting' | 'disconnected';
    badge: { text: string; color: string; bg: string };
    isPerp?: boolean;
    leverage?: number;
}> = ({ symbol, timeStr, connectionStatus, badge, isPerp, leverage }) => (
    <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)'
            }}>
                {symbol}
            </span>
            <span style={{
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.4px',
                background: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.color}25`
            }}>
                {badge.text}
            </span>
            {isPerp && leverage && (
                <span style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.4px',
                    background: 'var(--accent-gold-subtle)',
                    color: 'var(--accent-gold)',
                    border: '1px solid rgba(240, 185, 11, 0.25)'
                }}>
                    {leverage}×
                </span>
            )}
            <ConnectionStatus status={connectionStatus} />
        </div>
        <span style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em'
        }}>
            {timeStr}
        </span>
    </div>
);

const PriceHero: React.FC<{ price: number; decimals?: number }> = ({ price, decimals = 2 }) => (
    <div style={{
        padding: '32px 24px',
        background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.03) 0%, transparent 60%)',
        position: 'relative',
        overflow: 'hidden'
    }}>
        {/* Subtle glow */}
        <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-20%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'var(--accent-glow)',
            filter: 'blur(60px)',
            opacity: 0.3,
            pointerEvents: 'none'
        }} />

        <div style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontWeight: 600
        }}>
            Market Price
        </div>
        <div style={{
            fontSize: '36px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.04em',
            position: 'relative',
            zIndex: 1
        }}>
            ${price.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        </div>
    </div>
);

const PnLDisplay: React.FC<{
    totalPnl: number;
    pnlColor: string;
    pnlGlow: string;
    pnlBg: string;
    pnlSign: string;
}> = ({ totalPnl, pnlColor, pnlGlow, pnlBg, pnlSign }) => (
    <div style={{
        padding: '32px 28px',
        background: pnlBg,
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: '180px'
    }}>
        <div style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontWeight: 600
        }}>
            Total PnL
        </div>
        <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: pnlColor,
            fontFamily: 'var(--font-mono)',
            textShadow: `0 0 30px ${pnlGlow}`,
            letterSpacing: '-0.03em'
        }}>
            {pnlSign}${Math.abs(totalPnl).toFixed(2)}
        </div>
    </div>
);

const PnLCell: React.FC<{
    label: string;
    value: number;
    showNegative?: boolean;
    tooltip?: string;
}> = ({ label, value, showNegative, tooltip }) => {
    const color = showNegative
        ? 'var(--color-sell-bright)'
        : value >= 0 ? 'var(--color-buy-bright)' : 'var(--color-sell-bright)';
    const sign = showNegative ? '' : (value >= 0 ? '+' : '');

    return (
        <div style={{
            padding: '18px 20px',
            borderRight: '1px solid var(--border-color)',
            transition: 'background var(--transition-fast)'
        }}>
            <div style={{
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {tooltip ? (
                    <Tooltip content={tooltip}>
                        <span style={{ cursor: 'help', borderBottom: '1px dotted var(--text-tertiary)' }}>
                            {label}
                        </span>
                    </Tooltip>
                ) : label}
            </div>
            <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: color,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '-0.02em'
            }}>
                {sign}${Math.abs(value).toFixed(2)}
            </div>
        </div>
    );
};

const StatCell: React.FC<{
    label: string;
    value: string;
    subValue?: string;
    valueColor?: string;
    isLast?: boolean;
    highlight?: boolean;
    tooltip?: string;
}> = ({ label, value, subValue, valueColor, isLast, highlight, tooltip }) => (
    <div style={{
        padding: '18px 20px',
        borderRight: isLast ? 'none' : '1px solid var(--border-color)',
        transition: 'background var(--transition-fast)',
        background: highlight ? 'var(--accent-subtle)' : 'transparent'
    }}>
        <div style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        }}>
            {tooltip ? (
                <Tooltip content={tooltip}>
                    <span style={{ cursor: 'help', borderBottom: '1px dotted var(--text-tertiary)' }}>
                        {label}
                    </span>
                </Tooltip>
            ) : label}
        </div>
        <div style={{
            fontSize: '15px',
            fontWeight: 600,
            color: highlight ? 'var(--accent-primary)' : (valueColor || 'var(--text-primary)'),
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em',
            textShadow: highlight ? '0 0 16px var(--accent-glow)' : 'none'
        }}>
            {value}
        </div>
        {subValue && (
            <div style={{
                fontSize: '11px',
                color: valueColor || 'var(--text-secondary)',
                marginTop: '4px',
                fontWeight: 500
            }}>
                {subValue}
            </div>
        )}
    </div>
);

const CardFooter: React.FC<{ uptime: string }> = ({ uptime }) => (
    <div style={{
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: 'rgba(0, 0, 0, 0.25)'
    }}>
        <div className="icon-container">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        </div>
        <div>
            <div style={{
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginBottom: '2px'
            }}>
                Uptime
            </div>
            <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)'
            }}>
                {uptime}
            </div>
        </div>
    </div>
);

const ConnectionStatus: React.FC<{ status: 'connected' | 'connecting' | 'disconnected' }> = ({ status }) => {
    const statusConfig = {
        connected: {
            label: 'Live',
            color: 'var(--color-buy)',
            bgColor: 'var(--color-buy-bg)',
            dotClass: 'connected'
        },
        connecting: {
            label: 'Connecting',
            color: 'var(--color-warning)',
            bgColor: 'rgba(245, 158, 11, 0.1)',
            dotClass: 'connecting'
        },
        disconnected: {
            label: 'Offline',
            color: 'var(--color-sell)',
            bgColor: 'var(--color-sell-bg)',
            dotClass: 'disconnected'
        }
    };

    const config = statusConfig[status];

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            background: config.bgColor,
            border: `1px solid ${config.color}30`
        }}>
            <div className={`status-dot ${config.dotClass}`} style={{ width: '6px', height: '6px' }} />
            <span style={{
                fontSize: '10px',
                fontWeight: 600,
                color: config.color,
                letterSpacing: '0.3px',
                textTransform: 'uppercase'
            }}>
                {config.label}
            </span>
        </div>
    );
};

export default SummaryCard;
