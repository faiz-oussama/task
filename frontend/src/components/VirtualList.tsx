import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useStats, PAGE_SIZE } from '../hooks/useUsers';
import { fetchPage } from '../api/users';

interface VirtualListProps {
    scrollToIndex: number | null;
    onScrollToComplete: () => void;
}

// row component that fetches its own page data
// this enables true random access - each row only loads when visible
function RowRenderer({
    virtualRow,
    pageIndex,
    relativeIndex
}: {
    virtualRow: { index: number; size: number; start: number };
    pageIndex: number;
    relativeIndex: number;
}) {
    const { data, isLoading } = useQuery({
        queryKey: ['users', 'page', pageIndex],
        queryFn: () => fetchPage(pageIndex, PAGE_SIZE),
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    });

    const userName = data?.[relativeIndex];

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
            }}
            className="name-row"
        >
            {isLoading || !userName ? (
                <div className="loading-row">
                    <div className="skeleton skeleton-index" />
                    <div className="skeleton skeleton-name" />
                </div>
            ) : (
                <>
                    <span className="row-index">#{(virtualRow.index + 1).toLocaleString()}</span>
                    <span className="row-name">{userName}</span>
                    <span className="row-letter">{userName.charAt(0).toUpperCase()}</span>
                </>
            )}
        </div>
    );
}

export function VirtualList({ scrollToIndex, onScrollToComplete }: VirtualListProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const { data: stats, isLoading: isStatsLoading, isError } = useStats();

    // total count from stats, default to 0 while loading
    const totalCount = stats?.totalLines || 0;

    // virtualizer - uses 35px rows to stay within browser max height
    const virtualizer = useVirtualizer({
        count: totalCount,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 35,
        overscan: 5,
    });

    // handle programmatic scroll to index (teleport)
    if (scrollToIndex !== null && scrollToIndex >= 0 && totalCount > 0) {
        virtualizer.scrollToIndex(scrollToIndex, { align: 'start', behavior: 'smooth' });
        onScrollToComplete();
    }

    const virtualItems = virtualizer.getVirtualItems();

    if (isStatsLoading) {
        return (
            <div className="list-container">
                <div className="list-header">
                    <span className="list-title">Loading stats...</span>
                </div>
                <div className="virtual-list">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} className="loading-row">
                            <div className="skeleton skeleton-index" />
                            <div className="skeleton skeleton-name" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="list-container">
                <div className="error-container">
                    <h3 className="error-title">Failed to load data</h3>
                    <p className="error-message">
                        Make sure the backend server is running on port 3001
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="list-container">
            <div className="list-header">
                <span className="list-title">Names</span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="list-info">
                        Total: {totalCount.toLocaleString()}
                    </span>
                    <span className="perf-badge">
                        <span className="perf-dot" />
                        {virtualItems.length} DOM nodes
                    </span>
                </div>
            </div>

            <div ref={parentRef} className="virtual-list">
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {virtualItems.map((virtualItem) => {
                        // calculate which page this row belongs to
                        const pageIndex = Math.floor(virtualItem.index / PAGE_SIZE);
                        const relativeIndex = virtualItem.index % PAGE_SIZE;

                        return (
                            <RowRenderer
                                key={virtualItem.index}
                                virtualRow={virtualItem}
                                pageIndex={pageIndex}
                                relativeIndex={relativeIndex}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
