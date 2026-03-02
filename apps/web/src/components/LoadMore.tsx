'use client'

import { Loader2 } from 'lucide-react'

interface LoadMoreProps {
    count: number
    hasMore: boolean
    loading: boolean
    onLoadMore: () => void
    label?: string
}

export function LoadMore({ count, hasMore, loading, onLoadMore, label = 'components' }: LoadMoreProps) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '2rem',
        }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Showing {count} {label}
            </span>
            {hasMore && (
                <button
                    onClick={onLoadMore}
                    disabled={loading}
                    className="transition-base"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 2rem',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg-card)',
                        color: 'var(--color-text-primary)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            Loading...
                        </>
                    ) : (
                        'Load more'
                    )}
                </button>
            )}
            {!hasMore && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    You&apos;ve reached the end
                </span>
            )}
        </div>
    )
}
