import React from 'react';
import { useBotStore } from '../context/WebSocketContext';
import Tooltip from './Tooltip';

/**
 * Compact horizontal metrics bar showing key trading stats
 * Designed to sit at the top of the dashboard
 */
const MetricsBar: React.FC = () => {
    const { summary, lastTickTime, connectionStatus } = useBotStore();

    if (!summary) {
        return (
            <div className="card" style={{
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                animationDelay: '0ms'
            }}>
                <div className="skeleton" style={{ width: '120px', height: '32px' }} />
                <div className="skeleton" style={{ width: '100px', height: '24px' }} />
                <div style={{ flex: 1 }} />
                <div className="skeleton" style={{ width: '80px', height: '24px' }} />
                <div className="skeleton" style={{ width: '80px', height: '24px' }} />
                <div className="skeleton" style={{ width: '80px', height: '24px' }} />
            </div>
        );
    }

    const timeStr = lastTickTime ? new Date(lastTickTime).toLocaleTimeString() : '--:--:--';
    const isPerp = summary.type === 'perp_grid';
    const s = summary.data;

    const totalPnl = s.realized_pnl + s.unrealized_pnl - s.total_fees;
    const pnlColor = totalPnl >= 0 ? 'var(--color-buy-bright)' : 'var(--color-sell-bright)';
    const pnlSign = totalPnl >= 0 ? '+' : '';

    const perpData = isPerp ? summary.data as typeof summary.data & {
        position_side: string;
        leverage: number;
        grid_bias: string;
    } : null;

    const spotData = !isPerp ? summary.data as typeof summary.data & {
        base_balance: number;
        quote_balance: number;
    } : null;

    const positionColor = perpData?.position_side === 'Long' ? 'var(--color-buy-bright)' :
        perpData?.position_side === 'Short' ? 'var(--color-sell-bright)' :
            'var(--text-secondary)';

    const biasColor = perpData?.grid_bias === 'Long' ? 'var(--color-buy-bright)' :
        perpData?.grid_bias === 'Short' ? 'var(--color-sell-bright)' : 'var(--accent-primary)';

    const biasBg = perpData?.grid_bias === 'Long' ? 'var(--color-buy-bg)' :
        perpData?.grid_bias === 'Short' ? 'var(--color-sell-bg)' : 'var(--accent-subtle)';

    return (
        <div className="card" style={{
            padding: '0',
            overflow: 'hidden',
            animationDelay: '0ms'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'stretch',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)'
            }}>
                {/* Symbol + Price Section */}
                <div style={{
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    borderRight: '1px solid var(--border-color)',
                    background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.03) 0%, transparent 60%)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: 'var(--text-primary)'
                        }}>
                            {s.symbol}
                        </span>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '9px',
                            fontWeight: 600,
                            letterSpacing: '0.4px',
                            background: isPerp ? biasBg : 'var(--bg-hover)',
                            color: isPerp ? biasColor : 'var(--text-secondary)',
                            border: `1px solid ${isPerp ? biasColor : 'var(--text-secondary)'}20`
                        }}>
                            {isPerp ? perpData?.grid_bias?.toUpperCase() : 'SPOT'}
                        </span>
                        {isPerp && perpData?.leverage && (
                            <span style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '9px',
                                fontWeight: 600,
                                background: 'var(--accent-gold-subtle)',
                                color: 'var(--accent-gold)',
                                border: '1px solid rgba(240, 185, 11, 0.25)'
                            }}>
                                {perpData.leverage}×
                            </span>
                        )}
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.03em'
                    }}>
                        ${s.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </div>
                </div>

                {/* Total PnL */}
                <MetricItem
                    label="Total PnL"
                    value={`${pnlSign}$${Math.abs(totalPnl).toFixed(2)}`}
                    valueColor={pnlColor}
                    highlight
                />

                {/* Realized PnL */}
                <MetricItem
                    label="Realized"
                    value={`${s.realized_pnl >= 0 ? '+' : ''}$${Math.abs(s.realized_pnl).toFixed(2)}`}
                    valueColor={s.realized_pnl >= 0 ? 'var(--color-buy-bright)' : 'var(--color-sell-bright)'}
                />

                {/* Unrealized PnL */}
                <MetricItem
                    label="Unrealized"
                    value={`${s.unrealized_pnl >= 0 ? '+' : ''}$${Math.abs(s.unrealized_pnl).toFixed(2)}`}
                    valueColor={s.unrealized_pnl >= 0 ? 'var(--color-buy-bright)' : 'var(--color-sell-bright)'}
                />

                {/* Roundtrips */}
                <MetricItem
                    label="Roundtrips"
                    value={s.roundtrips.toString()}
                    valueColor="var(--accent-primary)"
                />

                {/* Position */}
                <MetricItem
                    label="Position"
                    value={isPerp ? Math.abs(perpData?.position_size || 0).toFixed(4) : (spotData?.position_size || 0).toFixed(4)}
                    subValue={isPerp ? perpData?.position_side : undefined}
                    valueColor={isPerp ? positionColor : 'var(--text-primary)'}
                />

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Connection Status + Time */}
                <div style={{
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    borderLeft: '1px solid var(--border-color)'
                }}>
                    <ConnectionStatus status={connectionStatus} />
                    <Tooltip content="Last tick time">
                        <span style={{
                            fontSize: '11px',
                            color: 'var(--text-tertiary)',
                            fontFamily: 'var(--font-mono)',
                            cursor: 'help'
                        }}>
                            {timeStr}
                        </span>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

const MetricItem: React.FC<{
    label: string;
    value: string;
    subValue?: string;
    valueColor?: string;
    highlight?: boolean;
}> = ({ label, value, subValue, valueColor, highlight }) => (
    <div style={{
        padding: '12px 20px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: highlight ? 'rgba(0, 245, 212, 0.03)' : 'transparent'
    }}>
        <div style={{
            fontSize: '9px',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 500,
            marginBottom: '4px'
        }}>
            {label}
        </div>
        <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: valueColor || 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em',
            textShadow: highlight ? `0 0 20px ${valueColor}40` : 'none'
        }}>
            {value}
        </div>
        {subValue && (
            <div style={{
                fontSize: '10px',
                color: valueColor || 'var(--text-secondary)',
                marginTop: '2px',
                fontWeight: 500
            }}>
                {subValue}
            </div>
        )}
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

export default MetricsBar;
