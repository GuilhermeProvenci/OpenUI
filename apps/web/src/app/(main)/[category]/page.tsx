'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { ComponentCard } from '@/components/ComponentCard'
import { Flame, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { categoryFromSlug, CATEGORIES } from '@openui/ui'
import type { ComponentWithAuthor, SortOption } from '@/types'

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'hot', label: 'Hot', icon: <Flame size={15} /> },
    { value: 'new', label: 'New', icon: <Clock size={15} /> },
    { value: 'top', label: 'Top', icon: <TrendingUp size={15} /> },
]

export default function CategoryPage({
    params,
}: {
    params: Promise<{ category: string }>
}) {
    const { category: slug } = use(params)
    const category = categoryFromSlug(slug)
    const catInfo = CATEGORIES.find((c) => c.value === category)

    const [components, setComponents] = useState<ComponentWithAuthor[]>([])
    const [userVotes, setUserVotes] = useState<Record<string, number>>({})
    const [sort, setSort] = useState<SortOption>('hot')
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    const fetchComponents = useCallback(
        async (reset = false) => {
            if (reset) setLoading(true)
            else setLoadingMore(true)
            try {
                const params = new URLSearchParams()
                params.set('sort', sort)
                params.set('category', category)
                if (!reset && cursor) params.set('cursor', cursor)

                const res = await fetch(`/api/components?${params}`)
                const data = await res.json()

                if (reset) {
                    setComponents(data.items)
                    setUserVotes(data.userVotes ?? {})
                } else {
                    setComponents((prev) => [...prev, ...data.items])
                    setUserVotes((prev) => ({ ...prev, ...(data.userVotes ?? {}) }))
                }
                setCursor(data.nextCursor)
                setHasMore(!!data.nextCursor)
            } catch (error) {
                console.error('Failed to fetch components', error)
            } finally {
                setLoading(false)
                setLoadingMore(false)
            }
        },
        [sort, cursor, category]
    )

    useEffect(() => {
        setComponents([])
        setCursor(null)
        setHasMore(true)
        fetchComponents(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort, category])

    return (
        <div
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem 1rem',
            }}
        >
            {/* Category Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem',
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>{catInfo?.emoji || '🧩'}</span>
                    <h1
                        style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            letterSpacing: '-0.5px',
                        }}
                    >
                        {catInfo?.label || slug} Components
                    </h1>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                    Browse and discover the best {catInfo?.label?.toLowerCase() || slug}{' '}
                    components shared by the community
                </p>
            </div>

            {/* Sort Tabs */}
            <div
                style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    padding: '0.25rem',
                    borderRadius: '12px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    width: 'fit-content',
                }}
            >
                {SORT_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => setSort(option.value)}
                        className="transition-base"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            background:
                                sort === option.value ? 'var(--color-bg-elevated)' : 'transparent',
                            color:
                                sort === option.value
                                    ? 'var(--color-text-primary)'
                                    : 'var(--color-text-tertiary)',
                            fontSize: '0.8125rem',
                            fontWeight: sort === option.value ? 600 : 400,
                            cursor: 'pointer',
                            boxShadow:
                                sort === option.value ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                        }}
                    >
                        {option.icon}
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.25rem',
                }}
            >
                {components.map((comp) => (
                    <ComponentCard
                        key={comp.id}
                        component={comp}
                        userVote={(userVotes[comp.id] as 1 | -1) ?? null}
                    />
                ))}
                {loading &&
                    Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={`skeleton-${i}`}
                            style={{
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '16px',
                                overflow: 'hidden',
                            }}
                        >
                            <div className="skeleton" style={{ height: '180px', borderRadius: 0 }} />
                            <div style={{ padding: '1rem' }}>
                                <div className="skeleton" style={{ height: '16px', width: '70%', marginBottom: '0.5rem' }} />
                                <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                            </div>
                        </div>
                    ))}
            </div>

            {!loading && components.length === 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '4rem 1rem',
                        color: 'var(--color-text-tertiary)',
                    }}
                >
                    <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                        No {catInfo?.label?.toLowerCase()} components yet
                    </p>
                    <p style={{ fontSize: '0.875rem' }}>Be the first to post one!</p>
                </div>
            )}

            {/* Load More */}
            {!loading && components.length > 0 && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '2rem',
                }}>
                    <span style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-muted)',
                    }}>
                        Showing {components.length} components
                    </span>
                    {hasMore && (
                        <button
                            onClick={() => fetchComponents(false)}
                            disabled={loadingMore}
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
                                cursor: loadingMore ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loadingMore ? (
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
                        <span style={{
                            fontSize: '0.8125rem',
                            color: 'var(--color-text-muted)',
                        }}>
                            You&apos;ve reached the end
                        </span>
                    )}
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
