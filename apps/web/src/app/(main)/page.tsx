'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ComponentCard } from '@/components/ComponentCard'
import {
    Flame,
    Clock,
    TrendingUp,
    Code2,
    ThumbsUp,
    GitFork,
    MessageSquare,
    Trophy,
    ChevronRight,
    ChevronUp,
    Loader2,
    ArrowDown,
} from 'lucide-react'
import type { ComponentWithAuthor, SortOption } from '@/types'

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'hot', label: 'Hot', icon: <Flame size={15} /> },
    { value: 'new', label: 'New', icon: <Clock size={15} /> },
    { value: 'top', label: 'Top', icon: <TrendingUp size={15} /> },
]

export default function HomePage() {
    return (
        <Suspense fallback={<HomePageSkeleton />}>
            <HomePageContent />
        </Suspense>
    )
}

function HomePageSkeleton() {
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div className="skeleton" style={{ height: '200px', borderRadius: '16px', marginBottom: '2rem' }} />
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
    )
}

function HomePageContent() {
    const searchParams = useSearchParams()
    const searchQuery = searchParams.get('q') || ''
    const feedRef = useRef<HTMLDivElement>(null)

    // Top 10 state
    const [topWeekly, setTopWeekly] = useState<ComponentWithAuthor[]>([])
    const [topVotes, setTopVotes] = useState<Record<string, number>>({})
    const [topLoading, setTopLoading] = useState(true)

    // Feed state
    const [components, setComponents] = useState<ComponentWithAuthor[]>([])
    const [userVotes, setUserVotes] = useState<Record<string, number>>({})
    const [sort, setSort] = useState<SortOption>('hot')
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    // Fetch top 10 this week
    useEffect(() => {
        async function fetchTop() {
            try {
                const res = await fetch('/api/components?sort=top&period=week&limit=10')
                const data = await res.json()
                setTopWeekly(data.items ?? [])
                setTopVotes(data.userVotes ?? {})
            } catch {
                // ignore
            } finally {
                setTopLoading(false)
            }
        }
        fetchTop()
    }, [])

    // Fetch feed components
    const fetchComponents = useCallback(
        async (reset = false) => {
            if (reset) setLoading(true)
            else setLoadingMore(true)
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
                setLoadingMore(false)
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

    const scrollToFeed = () => {
        feedRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const isSearching = !!searchQuery

    return (
        <div>
            {/* === HERO SECTION === */}
            {!isSearching && (
                <section style={{
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '5rem 1rem 4rem',
                    textAlign: 'center',
                }}>
                    {/* Background glow effect */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '800px',
                        height: '800px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.375rem 1rem',
                            borderRadius: '20px',
                            background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            fontSize: '0.8125rem',
                            color: 'var(--color-brand-light)',
                            fontWeight: 500,
                            marginBottom: '1.5rem',
                        }}>
                            <Code2 size={14} />
                            Open Source Component Platform
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 800,
                            letterSpacing: '-1.5px',
                            lineHeight: 1.15,
                            marginBottom: '1rem',
                        }}>
                            The Open Platform for{' '}
                            <span className="gradient-text">UI Components</span>
                        </h1>

                        <p style={{
                            fontSize: '1.125rem',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.7,
                            maxWidth: '540px',
                            margin: '0 auto 2rem',
                        }}>
                            Share, vote, fork, and suggest improvements to UI components.
                            Community-driven quality. Like Reddit, but for frontend devs.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                        }}>
                            <button
                                onClick={scrollToFeed}
                                className="transition-base"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.75rem',
                                    borderRadius: '12px',
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Explore Components
                                <ArrowDown size={16} />
                            </button>
                            <Link
                                href="/component/new"
                                className="transition-base"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.75rem',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                                }}
                            >
                                Post a Component
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* === FEATURE CARDS === */}
            {!isSearching && (
                <section style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    padding: '0 1rem 3rem',
                }}>
                    <div className="feature-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                    }}>
                        {[
                            {
                                icon: <ThumbsUp size={22} />,
                                title: 'Vote & Discover',
                                desc: 'Community votes surface the best components. Upvote what you love.',
                                color: 'var(--color-upvote)',
                                bg: 'rgba(249, 115, 22, 0.08)',
                            },
                            {
                                icon: <GitFork size={22} />,
                                title: 'Fork & Remix',
                                desc: 'Fork any component and make it your own. Build on others\' work.',
                                color: 'var(--color-brand-light)',
                                bg: 'rgba(99, 102, 241, 0.08)',
                            },
                            {
                                icon: <MessageSquare size={22} />,
                                title: 'Suggest Improvements',
                                desc: 'PR-style suggestions with diff viewer. Collaborate to improve components.',
                                color: 'var(--color-success)',
                                bg: 'rgba(34, 197, 94, 0.08)',
                            },
                        ].map((f) => (
                            <div
                                key={f.title}
                                style={{
                                    padding: '1.5rem',
                                    borderRadius: '14px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-card)',
                                }}
                            >
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: f.bg,
                                    color: f.color,
                                    marginBottom: '0.875rem',
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                    marginBottom: '0.375rem',
                                    color: 'var(--color-text-primary)',
                                }}>
                                    {f.title}
                                </h3>
                                <p style={{
                                    fontSize: '0.8125rem',
                                    color: 'var(--color-text-secondary)',
                                    lineHeight: 1.5,
                                }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* === TOP 10 THIS WEEK === */}
            {!isSearching && !topLoading && topWeekly.length > 0 && (
                <section style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 1rem 3rem',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        marginBottom: '1.25rem',
                    }}>
                        <Trophy size={20} style={{ color: 'var(--color-accent)' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                            Top This Week
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '0.75rem',
                    }}>
                        {topWeekly.map((comp, index) => (
                            <Link
                                key={comp.id}
                                href={`/component/${comp.id}`}
                                className="card-hover"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.875rem',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-card)',
                                    textDecoration: 'none',
                                }}
                            >
                                {/* Rank badge */}
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    fontSize: '0.8125rem',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    background: index === 0
                                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                                        : index === 1
                                            ? 'linear-gradient(135deg, #d1d5db, #9ca3af)'
                                            : index === 2
                                                ? 'linear-gradient(135deg, #d97706, #b45309)'
                                                : 'var(--color-bg-tertiary)',
                                    color: index < 3 ? '#fff' : 'var(--color-text-secondary)',
                                }}>
                                    {index + 1}
                                </span>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        color: 'var(--color-text-primary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {comp.title}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--color-text-muted)',
                                        marginTop: '0.125rem',
                                    }}>
                                        {comp.author?.avatarUrl && (
                                            <img
                                                src={comp.author.avatarUrl}
                                                alt=""
                                                style={{ width: '14px', height: '14px', borderRadius: '50%' }}
                                            />
                                        )}
                                        <span>{comp.author?.username}</span>
                                    </div>
                                </div>

                                {/* Score */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.25rem 0.625rem',
                                    borderRadius: '6px',
                                    background: comp.voteScore > 0
                                        ? 'rgba(249, 115, 22, 0.1)'
                                        : 'var(--color-bg-tertiary)',
                                    color: comp.voteScore > 0
                                        ? 'var(--color-upvote)'
                                        : 'var(--color-text-secondary)',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    flexShrink: 0,
                                }}>
                                    <ChevronUp size={14} />
                                    {comp.voteScore}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* === BROWSE COMPONENTS (FEED) === */}
            <section
                ref={feedRef}
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 1rem 3rem',
                }}
            >
                {/* Search indicator */}
                {isSearching && (
                    <div style={{
                        marginBottom: '1.5rem',
                        marginTop: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                            Results for
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--color-brand-light)' }}>
                            &quot;{searchQuery}&quot;
                        </span>
                    </div>
                )}

                {/* Section header + Sort tabs */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                }}>
                    {!isSearching && (
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                            Browse Components
                        </h2>
                    )}

                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        padding: '0.25rem',
                        borderRadius: '12px',
                        background: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                    }}>
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
                                    background: sort === option.value ? 'var(--color-bg-elevated)' : 'transparent',
                                    color: sort === option.value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                                    fontSize: '0.8125rem',
                                    fontWeight: sort === option.value ? 600 : 400,
                                    cursor: 'pointer',
                                    boxShadow: sort === option.value ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                                }}
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Components Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.25rem',
                }}>
                    {components.map((comp) => (
                        <ComponentCard
                            key={comp.id}
                            component={comp}
                            userVote={(userVotes[comp.id] as 1 | -1) ?? null}
                        />
                    ))}

                    {/* Loading skeletons (initial load) */}
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
                                    <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: '0.75rem' }} />
                                    <div className="skeleton" style={{ height: '20px', width: '50px' }} />
                                </div>
                            </div>
                        ))}
                </div>

                {/* No results */}
                {!loading && components.length === 0 && isSearching && (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 1rem',
                        color: 'var(--color-text-tertiary)',
                    }}>
                        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                            No components found
                        </p>
                        <p style={{ fontSize: '0.875rem' }}>
                            Try a different search term or browse categories
                        </p>
                    </div>
                )}

                {/* Empty state (no components at all) */}
                {!loading && components.length === 0 && !isSearching && (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem 1rem',
                        color: 'var(--color-text-tertiary)',
                    }}>
                        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                            No components yet
                        </p>
                        <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            Be the first to share a component!
                        </p>
                        <Link
                            href="/component/new"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.625rem 1.5rem',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                            }}
                        >
                            <Code2 size={16} />
                            Post a Component
                        </Link>
                    </div>
                )}

                {/* Load More / Showing count */}
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
            </section>

            {/* Responsive styles */}
            <style>{`
                @media (max-width: 768px) {
                    .feature-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
