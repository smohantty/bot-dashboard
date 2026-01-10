import React from 'react';
import { useBotStore } from '../context/WebSocketContext';
import Tooltip from './Tooltip';

/**
 * Compact 2-row metrics bar showing key trading stats
 * Row 1: Common metrics (symbol, price, PnL, fees, status)
 * Row 2: Strategy-specific metrics (spot: balances, perp: position)
 */
const MetricsBar: React.FC = () => {
    const { summary, connectionStatus, config, lastPrice } = useBotStore();

    // Get decimals from config for consistent formatting
    const szDecimals = config?.sz_decimals ?? 4;
    const pxDecimals = config?.px_decimals ?? 2;

    if (!summary) {
        return (
            <div className="card" style={{
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                animationDelay: '0ms'
            }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <div className="skeleton" style={{ width: '120px', height: '32px' }} />
                    <div className="skeleton" style={{ width: '100px', height: '24px' }} />
                    <div style={{ flex: 1 }} />
                    <div className="skeleton" style={{ width: '80px', height: '24px' }} />
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <div className="skeleton" style={{ width: '80px', height: '20px' }} />
                    <div className="skeleton" style={{ width: '80px', height: '20px' }} />
                    <div className="skeleton" style={{ width: '80px', height: '20px' }} />
                </div>
            </div>
        );
    }

    const isPerp = summary.type === 'perp_grid';
    const s = summary.data;

    const totalPnl = s.total_profit;
    const pnlColor = totalPnl >= 0 ? 'var(--color-buy-bright)' : 'var(--color-sell-bright)';

    const perpData = isPerp ? summary.data as typeof summary.data & {
        position_side: string;
        leverage: number;
        grid_bias: string;
        margin_balance: number;
    } : null;

    const spotData = !isPerp ? summary.data as typeof summary.data & {
        base_balance: number;
        quote_balance: number;
    } : null;

    const positionColor = perpData?.position_side === 'Long' ? 'var(--color-buy-bright)' :
        perpData?.position_side === 'Short' ? 'var(--color-sell-bright)' :
            'var(--text-secondary)';

    const biasColor = perpData?.grid_bias === 'long' ? 'var(--color-buy-bright)' :
        perpData?.grid_bias === 'short' ? 'var(--color-sell-bright)' : 'var(--accent-primary)';

    const biasBg = perpData?.grid_bias === 'long' ? 'var(--color-buy-bg)' :
        perpData?.grid_bias === 'short' ? 'var(--color-sell-bg)' : 'var(--accent-subtle)';

    // Parse symbol to get base/quote asset names (e.g., "LIT/USDC" or "LIT_USDC")
    const symbolParts = s.symbol.includes('/') ? s.symbol.split('/') : s.symbol.split('_');
    const baseAsset = symbolParts[0] || s.symbol;
    const quoteAsset = symbolParts[1] || 'USD';

    // Format helpers
    const formatPrice = (price: number) => `$${price.toFixed(pxDecimals)}`;
    const formatSize = (size: number) => size.toFixed(szDecimals);
    const formatPnl = (pnl: number) => {
        const sign = pnl >= 0 ? '+' : '';
        return `${sign}$${Math.abs(pnl).toFixed(2)}`;
    };
    const formatUsd = (val: number) => `$${val.toFixed(2)}`;

    return (
        <div className="card" style={{
            padding: '0',
            overflow: 'hidden',
            animationDelay: '0ms'
        }}>
            {/* Row 1: Common Metrics */}
            <div style={{
                display: 'flex',
                alignItems: 'stretch',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
                borderBottom: '1px solid var(--border-color)'
            }}>
                {/* Symbol + Price Section */}
                <div style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    borderRight: '1px solid var(--border-color)',
                    background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.03) 0%, transparent 60%)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: 'var(--text-primary)'
                        }}>
                            {s.symbol}
                        </span>
                        <span style={{
                            padding: '3px 6px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '8px',
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
                                padding: '3px 6px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '8px',
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
                        fontSize: '20px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.03em',
                        minWidth: '100px'
                    }}>
                        {formatPrice(lastPrice || 0)}
                    </div>
                </div>

                {/* Total PnL */}
                <MetricCell
                    label="Total PnL"
                    value={formatPnl(totalPnl)}
                    valueColor={pnlColor}
                    highlight
                />

                {/* Matched Profit */}
                <MetricCell
                    label="Matched Profit"
                    value={formatPnl(s.matched_profit)}
                    valueColor={s.matched_profit >= 0 ? 'var(--color-buy-bright)' : 'var(--color-sell-bright)'}
                />

                {/* Fees */}
                <MetricCell
                    label="Fees"
                    value={formatUsd(s.total_fees)}
                    valueColor="var(--color-sell-bright)"
                />

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Status + Uptime */}
                <div style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    borderLeft: '1px solid var(--border-color)'
                }}>
                    <ConnectionStatus status={connectionStatus} />
                    <Tooltip content="Bot running time">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'help'
                        }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                            <span style={{
                                fontSize: '10px',
                                color: 'var(--text-tertiary)',
                                fontFamily: 'var(--font-mono)'
                            }}>
                                {s.uptime}
                            </span>
                        </div>
                    </Tooltip>
                </div>
            </div>

            {/* Row 2: Strategy-Specific Metrics */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 0',
                background: 'rgba(0, 0, 0, 0.15)'
            }}>
                {isPerp ? (
                    // Perp Grid Row 2
                    <>
                        <MetricCellCompact
                            label="Position"
                            value={formatSize(Math.abs(perpData?.position_size || 0))}
                            subValue={perpData?.position_side}
                            valueColor={positionColor}
                        />
                        <MetricCellCompact
                            label="Margin"
                            value={formatUsd(perpData?.margin_balance || 0)}
                        />
                        {s.initial_entry_price && (
                            <MetricCellCompact
                                label="Start Entry"
                                value={formatPrice(s.initial_entry_price)}
                            />
                        )}
                        <MetricCellCompact
                            label="Matched"
                            value={s.roundtrips.toString()}
                            valueColor="var(--accent-primary)"
                            highlight
                        />
                    </>
                ) : (
                    // Spot Grid Row 2
                    <>
                        <MetricCellCompact
                            label={baseAsset}
                            value={formatSize(spotData?.base_balance || 0)}
                        />
                        <MetricCellCompact
                            label={quoteAsset}
                            value={formatUsd(spotData?.quote_balance || 0)}
                        />
                        {s.initial_entry_price && (
                            <MetricCellCompact
                                label="Start Entry"
                                value={formatPrice(s.initial_entry_price)}
                            />
                        )}
                        <MetricCellCompact
                            label="Matched"
                            value={s.roundtrips.toString()}
                            valueColor="var(--accent-primary)"
                            highlight
                        />
                    </>
                )}
                <div style={{ flex: 1 }} />
            </div>
        </div>
    );
};

// Full-size metric cell for Row 1
const MetricCell: React.FC<{
    label: string;
    value: string;
    valueColor?: string;
    highlight?: boolean;
}> = ({ label, value, valueColor, highlight }) => (
    <div style={{
        padding: '10px 16px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: highlight ? 'rgba(0, 245, 212, 0.03)' : 'transparent',
        minWidth: '75px'
    }}>
        <div style={{
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            letterSpacing: '0.2px',
            fontWeight: 500,
            marginBottom: '3px'
        }}>
            {label}
        </div>
        <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: valueColor || 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em',
            textShadow: highlight ? `0 0 20px ${valueColor}40` : 'none',
            whiteSpace: 'nowrap'
        }}>
            {value}
        </div>
    </div>
);

// Compact metric cell for Row 2
const MetricCellCompact: React.FC<{
    label: string;
    value: string;
    subValue?: string;
    valueColor?: string;
    highlight?: boolean;
}> = ({ label, value, subValue, valueColor, highlight }) => (
    <div style={{
        padding: '4px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderRight: '1px solid var(--border-subtle)',
        background: highlight ? 'rgba(0, 245, 212, 0.05)' : 'transparent',
        borderRadius: highlight ? 'var(--radius-sm)' : undefined
    }}>
        <span style={{
            fontSize: '10px',
            color: highlight ? 'var(--accent-primary)' : 'var(--text-tertiary)',
            letterSpacing: '0.2px',
            fontWeight: highlight ? 600 : 500
        }}>
            {label}
        </span>
        <span style={{
            fontSize: highlight ? '14px' : '12px',
            fontWeight: 700,
            color: valueColor || 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em',
            textShadow: highlight ? `0 0 15px ${valueColor || 'var(--accent-primary)'}60` : 'none'
        }}>
            {value}
        </span>
        {subValue && (
            <span style={{
                fontSize: '9px',
                color: valueColor || 'var(--text-secondary)',
                fontWeight: 500
            }}>
                {subValue}
            </span>
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

    const cfg = statusConfig[status];

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            background: cfg.bgColor,
            border: `1px solid ${cfg.color}30`
        }}>
            <div className={`status-dot ${cfg.dotClass}`} style={{ width: '5px', height: '5px' }} />
            <span style={{
                fontSize: '9px',
                fontWeight: 600,
                color: cfg.color,
                letterSpacing: '0.3px',
                textTransform: 'uppercase'
            }}>
                {cfg.label}
            </span>
        </div>
    );
};

export default MetricsBar;
