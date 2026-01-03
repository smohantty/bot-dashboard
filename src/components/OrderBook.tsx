import React, { useMemo } from 'react';
import { useBotStore } from '../context/WebSocketContext';
import type { ZoneInfo } from '../types/schema';
import Tooltip from './Tooltip';

const OrderBook: React.FC = () => {
    const { gridState, lastPrice, config } = useBotStore();

    const szDecimals = config?.sz_decimals || 4;

    const { asks, bids } = useMemo(() => {
        if (!gridState || !lastPrice) return { asks: [], bids: [] };

        // Sort all zones by price descending (highest first)
        const sortedZones = [...gridState.zones].sort((a, b) => b.upper_price - a.upper_price);

        const asks: ZoneInfo[] = [];
        const bids: ZoneInfo[] = [];

        sortedZones.forEach(zone => {
            if (zone.pending_side === 'Sell') {
                asks.push(zone);
            } else {
                bids.push(zone);
            }
        });

        // Both sides show closest to current price FIRST (at top)
        asks.reverse();

        return { asks, bids };
    }, [gridState, lastPrice]);

    if (!gridState || !lastPrice) {
        return (
            <div className="card" style={{
                padding: '80px 40px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                animationDelay: '200ms'
            }}>
                <div className="skeleton" style={{ width: '100%', height: '280px', borderRadius: 'var(--radius-md)' }} />
            </div>
        );
    }

    const isPerp = gridState.strategy_type === 'perp_grid';

    // Best ask (lowest sell) and best bid (highest buy) for spread display
    const bestAsk = asks.length > 0 ? asks[0] : null;
    const bestBid = bids.length > 0 ? bids[0] : null;
    const spread = bestAsk && bestBid
        ? ((bestAsk.upper_price - bestBid.lower_price) / lastPrice * 100).toFixed(3)
        : null;

    return (
        <div className="card" style={{
            overflow: 'hidden',
            animationDelay: '200ms'
        }}>
            {/* Header */}
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                            <path d="M3 3v18h18" />
                            <path d="M18 9l-5 5-4-4-3 3" />
                        </svg>
                    </div>
                    <span className="card-header-title">Order Book</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {spread && (
                        <span style={{
                            fontSize: '11px',
                            color: 'var(--text-tertiary)',
                            fontFamily: 'var(--font-mono)'
                        }}>
                            Spread: <span style={{ color: 'var(--accent-primary)' }}>{spread}%</span>
                        </span>
                    )}
                    <span className={`badge ${isPerp ? 'badge-neutral' : 'badge-muted'}`}>
                        {isPerp ? `PERP · ${gridState.grid_bias}` : 'SPOT'}
                    </span>
                </div>
            </div>

            {/* CLOB Layout - Prices meet in the middle */}
            <div style={{ display: 'flex', minHeight: '280px' }}>
                {/* Asks Side */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header: Action | Trades | Size | Dist | Price */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 50px 70px 60px 1fr',
                        padding: '12px 16px',
                        fontSize: '9px',
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        fontWeight: 600,
                        borderBottom: '1px solid var(--border-color)',
                        background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.04) 0%, transparent 100%)'
                    }}>
                        <span>Action</span>
                        <span style={{ textAlign: 'center' }}>Trades</span>
                        <span style={{ textAlign: 'center' }}>Size</span>
                        <span style={{ textAlign: 'right' }}>Dist</span>
                        <span style={{ textAlign: 'right' }}>Price</span>
                    </div>
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        maxHeight: '240px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {asks.length === 0 ? (
                            <EmptyState side="asks" />
                        ) : (
                            asks.map((zone, idx) => (
                                <ZoneRow
                                    key={zone.index}
                                    zone={zone}
                                    side="ask"
                                    szDecimals={szDecimals}
                                    currentPrice={lastPrice}
                                    isNearSpread={idx === 0}
                                    isPerp={isPerp}
                                    totalZones={asks.length}
                                    zoneIndex={idx}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Center Price Column */}
                <div style={{
                    width: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px 16px',
                    background: 'linear-gradient(180deg, var(--bg-base) 0%, rgba(3, 5, 8, 0.98) 100%)',
                    borderLeft: '1px solid var(--border-color)',
                    borderRight: '1px solid var(--border-color)',
                    position: 'relative'
                }}>
                    {/* Decorative glow - more intense */}
                    <div style={{
                        position: 'absolute',
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--accent-glow)',
                        filter: 'blur(50px)',
                        opacity: 0.5
                    }} />

                    <div style={{
                        fontSize: '9px',
                        color: 'var(--text-tertiary)',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1.2px',
                        fontWeight: 600
                    }}>
                        Current
                    </div>
                    <div style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                        textShadow: '0 0 30px var(--accent-glow)',
                        position: 'relative',
                        zIndex: 1,
                        letterSpacing: '-0.03em'
                    }}>
                        ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {/* Zone counts with visual bars */}
                    <div style={{
                        marginTop: '24px',
                        display: 'flex',
                        gap: '24px',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <ZoneCounter label="Asks" count={asks.length} color="var(--color-sell-bright)" />
                        <ZoneCounter label="Bids" count={bids.length} color="var(--color-buy-bright)" />
                    </div>
                </div>

                {/* Bids Side */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header: Price | Dist | Size | Trades | Action */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 60px 70px 50px 80px',
                        padding: '12px 16px',
                        fontSize: '9px',
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        fontWeight: 600,
                        borderBottom: '1px solid var(--border-color)',
                        background: 'linear-gradient(270deg, rgba(34, 197, 94, 0.04) 0%, transparent 100%)'
                    }}>
                        <span>Price</span>
                        <span>Dist</span>
                        <span style={{ textAlign: 'center' }}>Size</span>
                        <span style={{ textAlign: 'center' }}>Trades</span>
                        <span style={{ textAlign: 'right' }}>Action</span>
                    </div>
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        maxHeight: '240px'
                    }}>
                        {bids.length === 0 ? (
                            <EmptyState side="bids" />
                        ) : (
                            bids.map((zone, idx) => (
                                <ZoneRow
                                    key={zone.index}
                                    zone={zone}
                                    side="bid"
                                    szDecimals={szDecimals}
                                    currentPrice={lastPrice}
                                    isNearSpread={idx === 0}
                                    isPerp={isPerp}
                                    totalZones={bids.length}
                                    zoneIndex={idx}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ZoneCounter: React.FC<{ label: string; count: number; color: string }> = ({ label, count, color }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{
            color: color,
            fontWeight: 700,
            fontSize: '20px',
            fontFamily: 'var(--font-mono)',
            textShadow: `0 0 16px ${color}50`,
            letterSpacing: '-0.02em'
        }}>
            {count}
        </div>
        <div style={{
            color: 'var(--text-tertiary)',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginTop: '4px',
            fontWeight: 500
        }}>
            {label}
        </div>
    </div>
);

const EmptyState: React.FC<{ side: 'asks' | 'bids' }> = ({ side }) => (
    <div style={{
        padding: '50px 20px',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: '12px'
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--bg-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        </div>
        <span style={{ fontWeight: 500 }}>No {side}</span>
    </div>
);

const ZoneRow: React.FC<{
    zone: ZoneInfo;
    side: 'ask' | 'bid';
    szDecimals: number;
    currentPrice: number;
    isNearSpread?: boolean;
    isPerp: boolean;
    totalZones: number;
    zoneIndex: number;
}> = ({ zone, side, szDecimals, currentPrice, isNearSpread, isPerp, totalZones, zoneIndex }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const isAsk = side === 'ask';
    const displayPrice = isAsk ? zone.upper_price : zone.lower_price;
    const nextPrice = isAsk ? zone.lower_price : zone.upper_price;

    const isClose = zone.is_reduce_only;
    const actionColor = isClose ? 'var(--color-warning)' :
        zone.pending_side === 'Buy' ? 'var(--color-buy-bright)' : 'var(--color-sell-bright)';

    const displayLabel = !isPerp
        ? zone.pending_side
        : isClose
            ? (zone.pending_side === 'Buy' ? 'Buy (Close)' : 'Sell (Close)')
            : (zone.pending_side === 'Buy' ? 'Buy (Open)' : 'Sell (Open)');

    // Calculate distance from current price (as percentage)
    const distancePercent = ((displayPrice - currentPrice) / currentPrice * 100);
    const distanceDisplay = distancePercent >= 0
        ? `+${distancePercent.toFixed(2)}%`
        : `${distancePercent.toFixed(2)}%`;

    // Color based on how close (closer = more vivid)
    const absDistance = Math.abs(distancePercent);
    const distanceColor = absDistance < 0.5
        ? 'var(--accent-primary)'
        : absDistance < 1
            ? 'var(--text-primary)'
            : 'var(--text-secondary)';

    // Calculate depth opacity (closer = brighter)
    const depthOpacity = zone.has_order ? 1 : 0.35;
    const rowBrightness = isNearSpread ? 1 : Math.max(0.6, 1 - (zoneIndex / totalZones) * 0.4);

    const actionBadge = (
        <span style={{
            background: `${actionColor}18`,
            border: `1px solid ${actionColor}35`,
            color: actionColor,
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.3px',
            whiteSpace: 'nowrap'
        }}>
            {displayLabel}
        </span>
    );

    const priceDisplay = (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isAsk ? 'flex-end' : 'flex-start',
            gap: '2px'
        }}>
            <span style={{
                color: isAsk ? 'var(--color-sell-bright)' : 'var(--color-buy-bright)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: '12px',
                letterSpacing: '-0.02em',
                textShadow: isNearSpread ? `0 0 12px ${isAsk ? 'var(--color-sell-glow)' : 'var(--color-buy-glow)'}` : 'none'
            }}>
                {displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <Tooltip content="Next Order Price (Ping-Pong)">
                <span style={{
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'help',
                    fontSize: '10px',
                    letterSpacing: '-0.02em'
                }}>
                    {nextPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            </Tooltip>
        </div>
    );

    const baseRowBg = isNearSpread
        ? (isAsk ? 'rgba(239, 68, 68, 0.04)' : 'rgba(34, 197, 94, 0.04)')
        : 'transparent';

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: isAsk ? '80px 50px 70px 60px 1fr' : '1fr 60px 70px 50px 80px',
                alignItems: 'center',
                padding: '10px 16px',
                fontSize: '12px',
                opacity: depthOpacity * rowBrightness,
                borderBottom: '1px solid var(--border-color)',
                background: isHovered ? 'var(--bg-hover)' : baseRowBg,
                transition: 'all var(--transition-fast)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isAsk ? (
                // Asks: Action | Trades | Size | Dist | Price
                <>
                    <div>{actionBadge}</div>
                    <span style={{
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        color: zone.roundtrip_count > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: zone.roundtrip_count > 0 ? 600 : 400,
                        textShadow: zone.roundtrip_count > 0 ? '0 0 10px var(--accent-glow)' : 'none'
                    }}>
                        {zone.roundtrip_count}
                    </span>
                    <span style={{
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        letterSpacing: '-0.02em'
                    }}>
                        {zone.size.toFixed(szDecimals)}
                    </span>
                    <span style={{
                        textAlign: 'right',
                        fontFamily: 'var(--font-mono)',
                        color: distanceColor,
                        fontSize: '10px',
                        fontWeight: 500,
                        letterSpacing: '-0.02em'
                    }}>
                        {distanceDisplay}
                    </span>
                    <div style={{ textAlign: 'right' }}>{priceDisplay}</div>
                </>
            ) : (
                // Bids: Price | Dist | Size | Trades | Action
                <>
                    <div>{priceDisplay}</div>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        color: distanceColor,
                        fontSize: '10px',
                        fontWeight: 500,
                        letterSpacing: '-0.02em'
                    }}>
                        {distanceDisplay}
                    </span>
                    <span style={{
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        letterSpacing: '-0.02em'
                    }}>
                        {zone.size.toFixed(szDecimals)}
                    </span>
                    <span style={{
                        textAlign: 'center',
                        fontFamily: 'var(--font-mono)',
                        color: zone.roundtrip_count > 0 ? 'var(--accent-primary)' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: zone.roundtrip_count > 0 ? 600 : 400,
                        textShadow: zone.roundtrip_count > 0 ? '0 0 10px var(--accent-glow)' : 'none'
                    }}>
                        {zone.roundtrip_count}
                    </span>
                    <div style={{ textAlign: 'right' }}>{actionBadge}</div>
                </>
            )}
        </div>
    );
};

export default OrderBook;
