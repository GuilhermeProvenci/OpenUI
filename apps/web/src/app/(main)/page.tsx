'use client'

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ComponentCard } from '@/components/ComponentCard'
import { SortTabs } from '@/components/SortTabs'
import { ComponentGridSkeleton } from '@/components/ComponentGridSkeleton'
import { LoadMore } from '@/components/LoadMore'
import { EmptyState } from '@/components/EmptyState'
import {
    Code2,
    ThumbsUp,
    GitFork,
    MessageSquare,
    Trophy,
    ChevronRight,
    ArrowDown,
    User,
} from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { FeatureCard } from '@/components/FeatureCard'
import { RankedComponentCard } from '@/components/RankedComponentCard'
import type { ComponentWithAuthor, SortOption } from '@/types'

export default function HomePage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div className="skeleton" style={{ height: '200px', borderRadius: '16px', marginBottom: '2rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    <ComponentGridSkeleton />
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
    const feedRef = useRef<HTMLDivElement>(null)

    // Search users state
    const [searchUsers, setSearchUsers] = useState<{ id: string; username: string; avatarUrl: string | null; bio: string | null; _count: { components: number } }[]>([])

    // Top 10 state
    const [topWeekly, setTopWeekly] = useState<ComponentWithAuthor[]>([])
    const [topLoading, setTopLoading] = useState(true)

    // Feed state
    const [components, setComponents] = useState<ComponentWithAuthor[]>([])
    const [userVotes, setUserVotes] = useState<Record<string, number>>({})
    const [sort, setSort] = useState<SortOption>('hot')
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    // Fetch users when searching
    useEffect(() => {
        if (!searchQuery) {
            setSearchUsers([])
            return
        }
        async function fetchUsers() {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
                const data = await res.json()
                setSearchUsers(data.users ?? [])
            } catch {
                // ignore
            }
        }
        fetchUsers()
    }, [searchQuery])

    // Fetch top 10 this week
    useEffect(() => {
        async function fetchTop() {
            try {
                const res = await fetch('/api/components?sort=top&period=week&limit=10')
                const data = await res.json()
                setTopWeekly(data.items ?? [])
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
                <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem 3rem' }}>
                    <div className="feature-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                    }}>
                        <FeatureCard icon={<ThumbsUp size={22} />} title="Vote & Discover" description="Community votes surface the best components. Upvote what you love." color="var(--color-upvote)" bg="rgba(249, 115, 22, 0.08)" />
                        <FeatureCard icon={<GitFork size={22} />} title="Fork & Remix" description="Fork any component and make it your own. Build on others' work." color="var(--color-brand-light)" bg="rgba(99, 102, 241, 0.08)" />
                        <FeatureCard icon={<MessageSquare size={22} />} title="Suggest Improvements" description="PR-style suggestions with diff viewer. Collaborate to improve components." color="var(--color-success)" bg="rgba(34, 197, 94, 0.08)" />
                    </div>
                </section>
            )}

            {/* === TOP 10 THIS WEEK === */}
            {!isSearching && !topLoading && topWeekly.length > 0 && (
                <section style={{
                    maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 3rem',
                }}>
                    <div style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        border: '1px solid var(--color-border)',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.03), rgba(99, 102, 241, 0.02))',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '36px', height: '36px', borderRadius: '10px',
                                background: 'rgba(245, 158, 11, 0.1)',
                            }}>
                                <Trophy size={20} style={{ color: 'var(--color-accent)' }} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Top This Week</h2>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Most voted components in the last 7 days</p>
                            </div>
                        </div>
                        {/* #1 — Featured */}
                        {topWeekly.length > 0 && (
                            <RankedComponentCard
                                key={topWeekly[0].id}
                                id={topWeekly[0].id}
                                rank={1}
                                title={topWeekly[0].title}
                                voteScore={topWeekly[0].voteScore}
                                author={topWeekly[0].author}
                                category={topWeekly[0].category}
                                codeJsx={topWeekly[0].codeJsx}
                                codeHtml={topWeekly[0].codeHtml}
                                codeCss={topWeekly[0].codeCss}
                                codeJs={topWeekly[0].codeJs}
                                featured
                            />
                        )}

                        {/* #2–#10 — 3-column grid */}
                        {topWeekly.length > 1 && (
                            <div className="top-week-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                                {topWeekly.slice(1).map((comp, index) => (
                                    <RankedComponentCard
                                        key={comp.id}
                                        id={comp.id}
                                        rank={index + 2}
                                        title={comp.title}
                                        voteScore={comp.voteScore}
                                        author={comp.author}
                                        category={comp.category}
                                        codeJsx={comp.codeJsx}
                                        codeHtml={comp.codeHtml}
                                        codeCss={comp.codeCss}
                                        codeJs={comp.codeJs}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* === BROWSE COMPONENTS (FEED) === */}
            <section ref={feedRef} style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 3rem' }}>
                {isSearching && (
                    <div style={{ marginBottom: '1.5rem', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Results for</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-brand-light)' }}>&quot;{searchQuery}&quot;</span>
                    </div>
                )}

                {/* User results when searching */}
                {isSearching && searchUsers.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <User size={14} /> Users
                        </h3>
                        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {searchUsers.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/profile/${user.username}`}
                                    className="card-hover"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        textDecoration: 'none',
                                        color: 'var(--color-text-primary)',
                                        minWidth: '220px',
                                        flexShrink: 0,
                                    }}
                                >
                                    <Avatar src={user.avatarUrl} alt={user.username} size={40} fallback={user.username} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.username}</div>
                                        {user.bio && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                                                {user.bio}
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-tertiary)', marginTop: '0.125rem' }}>
                                            {user._count.components} component{user._count.components !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {!isSearching && <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Browse Components</h2>}
                    <SortTabs value={sort} onChange={setSort} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {components.map((comp) => (
                        <ComponentCard key={comp.id} component={comp} userVote={(userVotes[comp.id] as 1 | -1) ?? null} />
                    ))}
                    {loading && <ComponentGridSkeleton />}
                </div>

                {!loading && components.length === 0 && isSearching && (
                    <EmptyState title="No components found" description="Try a different search term or browse categories" />
                )}

                {!loading && components.length === 0 && !isSearching && (
                    <EmptyState title="No components yet" description="Be the first to share a component!" actionLabel="Post a Component" actionHref="/component/new" actionIcon={<Code2 size={16} />} />
                )}

                {!loading && components.length > 0 && (
                    <LoadMore count={components.length} hasMore={hasMore} loading={loadingMore} onLoadMore={() => fetchComponents(false)} />
                )}
            </section>

            <style>{`
                @media (max-width: 768px) {
                    .feature-grid { grid-template-columns: 1fr !important; }
                    .top-week-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}
