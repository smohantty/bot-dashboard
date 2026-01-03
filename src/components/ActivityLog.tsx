import React, { useEffect, useRef } from 'react';
import { useBotStore } from '../context/WebSocketContext';
import type { OrderEvent } from '../types/schema';

const ActivityLog: React.FC = () => {
    const { orderHistory, config } = useBotStore();
    const szDecimals = config?.sz_decimals ?? 4;
    const pxDecimals = config?.px_decimals ?? 2;
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
            minHeight: '160px',
            maxHeight: '350px',
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

            {/* Column Headers - Simplified 4 columns */}
            {orderHistory.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 80px 70px',
                    padding: '8px 16px',
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    letterSpacing: '0.5px',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--border-color)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    alignItems: 'center'
                }}>
                    <span>Order</span>
                    <span style={{ textAlign: 'right' }}>Price</span>
                    <span style={{ textAlign: 'right' }}>Size</span>
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
                        padding: '48px 20px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'var(--bg-hover)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'pulse 3s ease-in-out infinite'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                                <path d="M12 8v4l3 3" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        </div>
                        <div>
                            <div style={{
                                color: 'var(--text-secondary)',
                                fontSize: '12px',
                                fontWeight: 500,
                                marginBottom: '2px'
                            }}>
                                Waiting for orders...
                            </div>
                            <div style={{
                                color: 'var(--text-tertiary)',
                                fontSize: '10px'
                            }}>
                                Orders will appear here
                            </div>
                        </div>
                    </div>
                ) : (
                    orderHistory.map((order, idx) => (
                        <OrderEventRow
                            key={`${order.cloid || order.oid}-${idx}`}
                            order={order}
                            szDecimals={szDecimals}
                            pxDecimals={pxDecimals}
                            isFirst={idx === 0}
                            isOdd={idx % 2 === 1}
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
    pxDecimals: number;
    isFirst?: boolean;
    isOdd?: boolean;
}> = ({ order, szDecimals, pxDecimals, isFirst, isOdd }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const isBuy = order.side === 'Buy';

    const status = order.status.toLowerCase();
    const isFilled = status === 'filled';
    const isOpen = status === 'open';

    const sideColor = isBuy ? 'var(--color-buy-bright)' : 'var(--color-sell-bright)';
    const sideBg = isBuy ? 'var(--color-buy-bg)' : 'var(--color-sell-bg)';

    const getStatusConfig = () => {
        switch (status) {
            case 'filled':
                return { dot: '●', label: 'filled', color: 'var(--color-buy-bright)' };
            case 'open':
                return { dot: '○', label: 'open', color: 'var(--accent-primary)' };
            case 'opening':
                return { dot: '◐', label: 'opening', color: 'var(--color-warning)' };
            case 'cancelled':
                return { dot: '○', label: 'cancelled', color: 'var(--text-muted)' };
            default:
                return { dot: '○', label: status, color: 'var(--text-tertiary)' };
        }
    };

    const statusConfig = getStatusConfig();
    const altRowBg = isOdd ? 'rgba(255, 255, 255, 0.015)' : 'transparent';
    const fillBg = isFilled ? 'rgba(0, 245, 212, 0.03)' : 'transparent'; // Subtle highlight for fills

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px 70px',
                alignItems: 'center',
                padding: '10px 16px',
                fontSize: '11px',
                borderBottom: '1px solid var(--border-color)',
                background: isFirst
                    ? 'rgba(0, 245, 212, 0.06)'
                    : isHovered
                        ? 'var(--bg-hover)'
                        : isFilled ? fillBg : altRowBg,
                animation: isFirst ? 'flashIn 0.5s ease-out' : 'none',
                transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Order: Combined Status + Side Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Status dot */}
                <span style={{
                    color: statusConfig.color,
                    fontSize: '8px',
                    animation: isOpen ? 'pulse 2s ease-in-out infinite' : 'none'
                }}>
                    {statusConfig.dot}
                </span>

                {/* Side badge */}
                <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                    background: sideBg,
                    color: sideColor,
                    border: `1px solid ${sideColor}25`
                }}>
                    {isBuy ? 'BUY' : 'SELL'}
                </span>

                {/* Status text (subtle) */}
                <span style={{
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    textTransform: 'lowercase'
                }}>
                    {statusConfig.label}
                </span>
            </div>

            {/* Price (Primary Emphasis) */}
            <span style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                fontWeight: 500,
                textAlign: 'right',
                letterSpacing: '-0.02em'
            }}>
                ${order.price.toFixed(pxDecimals)}
            </span>

            {/* Size (Secondary Emphasis) */}
            <span style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                textAlign: 'right',
                letterSpacing: '-0.02em'
            }}>
                {order.size.toFixed(szDecimals)}
            </span>

            {/* Fee */}
            <span style={{
                color: isFilled && order.fee > 0 ? 'var(--color-sell-bright)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                textAlign: 'right',
                letterSpacing: '-0.02em'
            }}>
                {isFilled && order.fee > 0 ? `-$${order.fee.toFixed(2)}` : '--'}
            </span>
        </div>
    );
};

export default ActivityLog;
