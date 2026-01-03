import React, { useEffect, useRef } from 'react';
import { useBotStore } from '../context/WebSocketContext';
import type { OrderEvent } from '../types/schema';

const ActivityLog: React.FC = () => {
    const { orderHistory, config } = useBotStore();
    const szDecimals = config?.sz_decimals || 4;
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to top on new orders
    useEffect(() => {
        if (scrollRef.current && orderHistory.length > 0) {
            scrollRef.current.scrollTop = 0;
        }
    }, [orderHistory.length]);

    return (
        <div className="card" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: '180px',
            maxHeight: '380px',
            animationDelay: '160ms'
        }}>
            {/* Header */}
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: 'var(--accent-subtle)',
                        border: '1px solid rgba(0, 245, 212, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2">
                            <path d="M12 8v4l3 3" />
                            <circle cx="12" cy="12" r="10" />
                        </svg>
                    </div>
                    <span className="card-header-title">Activity</span>
                </div>
                {orderHistory.length > 0 && (
                    <span className="badge badge-muted" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        {orderHistory.length}
                    </span>
                )}
            </div>

            {/* Column Headers */}
            {orderHistory.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 50px 70px 1fr 80px',
                    padding: '10px 18px',
                    fontSize: '9px',
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border-color)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    alignItems: 'center'
                }}>
                    <span>Status</span>
                    <span>Side</span>
                    <span>Size</span>
                    <span>Price</span>
                    <span style={{ textAlign: 'right' }}>Fee</span>
                </div>
            )}

            {/* Activity List */}
            <div
                ref={scrollRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}
            >
                {orderHistory.length === 0 ? (
                    <div style={{
                        padding: '60px 20px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'var(--bg-hover)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'pulse 3s ease-in-out infinite'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                                <path d="M12 8v4l3 3" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        </div>
                        <div>
                            <div style={{
                                color: 'var(--text-secondary)',
                                fontSize: '13px',
                                fontWeight: 500,
                                marginBottom: '4px'
                            }}>
                                Waiting for orders...
                            </div>
                            <div style={{
                                color: 'var(--text-tertiary)',
                                fontSize: '11px'
                            }}>
                                Orders will appear here as they execute
                            </div>
                        </div>
                    </div>
                ) : (
                    orderHistory.map((order, idx) => (
                        <OrderEventRow
                            key={`${order.cloid || order.oid}-${idx}`}
                            order={order}
                            szDecimals={szDecimals}
                            isFirst={idx === 0}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const OrderEventRow: React.FC<{
    order: OrderEvent;
    szDecimals: number;
    isFirst?: boolean;
}> = ({ order, szDecimals, isFirst }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const isBuy = order.side === 'Buy';
    const isFilled = order.status === 'FILLED';

    const sideColor = isBuy ? 'var(--color-buy-bright)' : 'var(--color-sell-bright)';

    const getStatusConfig = () => {
        switch (order.status) {
            case 'FILLED':
                return {
                    icon: '✓',
                    label: 'Filled',
                    color: 'var(--color-buy-bright)',
                    bg: 'var(--color-buy-bg)'
                };
            case 'OPEN':
                return {
                    icon: '●',
                    label: 'Open',
                    color: 'var(--accent-primary)',
                    bg: 'var(--accent-subtle)'
                };
            case 'OPENING':
                return {
                    icon: '◐',
                    label: 'Opening',
                    color: 'var(--color-warning)',
                    bg: 'rgba(245, 158, 11, 0.1)'
                };
            case 'CANCELLED':
                return {
                    icon: '✕',
                    label: 'Cancelled',
                    color: 'var(--text-tertiary)',
                    bg: 'transparent'
                };
            default:
                return {
                    icon: '!',
                    label: order.status,
                    color: 'var(--color-sell-bright)',
                    bg: 'var(--color-sell-bg)'
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '70px 50px 70px 1fr 80px',
                alignItems: 'center',
                padding: '12px 18px',
                fontSize: '12px',
                borderBottom: '1px solid var(--border-color)',
                background: isFirst
                    ? 'rgba(0, 245, 212, 0.04)'
                    : isHovered
                        ? 'var(--bg-hover)'
                        : 'transparent',
                animation: isFirst ? 'flashIn 0.5s ease-out' : 'none',
                transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Status */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                <span style={{
                    color: statusConfig.color,
                    fontSize: '10px',
                    animation: order.status === 'OPEN' ? 'pulse 2s ease-in-out infinite' : 'none'
                }}>
                    {statusConfig.icon}
                </span>
                <span style={{
                    color: statusConfig.color,
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.3px'
                }}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Side */}
            <span style={{
                color: sideColor,
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.3px'
            }}>
                {order.side}
            </span>

            {/* Size */}
            <span style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                fontWeight: 500,
                fontSize: '11px',
                letterSpacing: '-0.02em'
            }}>
                {order.size.toFixed(szDecimals)}
            </span>

            {/* Price */}
            <span style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '-0.02em'
            }}>
                ${order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>

            {/* Fee */}
            <span style={{
                color: isFilled && order.fee > 0 ? 'var(--color-sell-bright)' : 'var(--text-muted)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                textAlign: 'right',
                letterSpacing: '-0.02em'
            }}>
                {isFilled && order.fee > 0 ? `-$${order.fee.toFixed(4)}` : '--'}
            </span>
        </div>
    );
};

export default ActivityLog;
