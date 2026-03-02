'use client'

import { Suspense, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ComponentCard } from '@/components/ComponentCard'
import { Flame, Clock, TrendingUp, Sparkles, Code2 } from 'lucide-react'
import type { ComponentWithAuthor, SortOption } from '@/types'

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'hot', label: 'Hot', icon: <Flame size={15} /> },
    { value: 'new', label: 'New', icon: <Clock size={15} /> },
    { value: 'top', label: 'Top', icon: <TrendingUp size={15} /> },
]

export default function HomePage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="skeleton" style={{ height: '180px', borderRadius: 0 }} />
                            <div style={{ padding: '1rem' }}>
                                <div className="skeleton" style={{ height: '16px', width: '70%', marginBottom: '0.5rem' }} />
                                <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        }>
            <HomePageContent />
        </Suspense>
    )
}

function HomePageContent() {
    const searchParams = useSearchParams()
    const searchQuery = searchParams.get('q') || ''

    const [components, setComponents] = useState<ComponentWithAuthor[]>([])
    const [userVotes, setUserVotes] = useState<Record<string, number>>({})
    const [sort, setSort] = useState<SortOption>('hot')
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const observerRef = useRef<HTMLDivElement>(null)

    const fetchComponents = useCallback(
        async (reset = false) => {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                params.set('sort', sort)
                if (!reset && cursor) params.set('cursor', cursor)
                if (searchQuery) params.set('q', searchQuery)

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
            }
        },
        [sort, cursor, searchQuery]
    )

    // Reset when sort or search changes
    useEffect(() => {
        setComponents([])
        setCursor(null)
        setHasMore(true)
        fetchComponents(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort, searchQuery])

    // Infinite scroll with Intersection Observer
    useEffect(() => {
        if (!hasMore || loading) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchComponents(false)
                }
            },
            { rootMargin: '200px' }
        )

        if (observerRef.current) {
            observer.observe(observerRef.current)
        }

        return () => observer.disconnect()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMore, loading])

    return (
        <div
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem 1rem',
            }}
        >
            {/* Hero section for empty state / first visit */}
            {components.length === 0 && !loading && !searchQuery && (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '4rem 1rem',
                        marginBottom: '2rem',
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '80px',
                            height: '80px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(245,158,11,0.2))',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <Sparkles size={36} style={{ color: 'var(--color-brand-light)' }} />
                    </div>
                    <h1
                        style={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            marginBottom: '0.75rem',
                            letterSpacing: '-1px',
                        }}
                    >
                        Discover <span className="gradient-text">UI Components</span>
                    </h1>
                    <p
                        style={{
                            fontSize: '1.125rem',
                            color: 'var(--color-text-secondary)',
                            maxWidth: '500px',
                            margin: '0 auto 2rem',
                            lineHeight: 1.6,
                        }}
                    >
                        An open platform for sharing, voting, and forking UI components.
                        Like Reddit, but for frontend devs.
                    </p>
                    <a
                        href="/component/new"
                        className="transition-base"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 2rem',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                        }}
                    >
                        <Code2 size={18} />
                        Post your first component
                    </a>
                </div>
            )}

            {/* Search indicator */}
            {searchQuery && (
                <div
                    style={{
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                        Results for
                    </span>
                    <span
                        style={{
                            fontWeight: 600,
                            color: 'var(--color-brand-light)',
                        }}
                    >
                        &quot;{searchQuery}&quot;
                    </span>
                </div>
            )}

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
                                sort === option.value
                                    ? '0 2px 8px rgba(0,0,0,0.2)'
                                    : 'none',
                        }}
                    >
                        {option.icon}
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Components Grid */}
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

                {/* Loading skeletons */}
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
                                <div
                                    className="skeleton"
                                    style={{ height: '16px', width: '70%', marginBottom: '0.5rem' }}
                                />
                                <div
                                    className="skeleton"
                                    style={{ height: '12px', width: '40%', marginBottom: '0.75rem' }}
                                />
                                <div
                                    className="skeleton"
                                    style={{ height: '20px', width: '50px' }}
                                />
                            </div>
                        </div>
                    ))}
            </div>

            {/* No results */}
            {!loading && components.length === 0 && searchQuery && (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '4rem 1rem',
                        color: 'var(--color-text-tertiary)',
                    }}
                >
                    <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                        No components found
                    </p>
                    <p style={{ fontSize: '0.875rem' }}>
                        Try a different search term or browse categories
                    </p>
                </div>
            )}

            {/* Infinite scroll trigger */}
            <div ref={observerRef} style={{ height: '1px' }} />
        </div>
    )
}
