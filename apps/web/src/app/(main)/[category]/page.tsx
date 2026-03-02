'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { ComponentCard } from '@/components/ComponentCard'
import { SortTabs } from '@/components/SortTabs'
import { ComponentGridSkeleton } from '@/components/ComponentGridSkeleton'
import { LoadMore } from '@/components/LoadMore'
import { EmptyState } from '@/components/EmptyState'
import { categoryFromSlug, CATEGORIES } from '@openui/ui'
import type { ComponentWithAuthor, SortOption } from '@/types'

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
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>{catInfo?.emoji || '🧩'}</span>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                        {catInfo?.label || slug} Components
                    </h1>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
                    Browse and discover the best {catInfo?.label?.toLowerCase() || slug} components shared by the community
                </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <SortTabs value={sort} onChange={setSort} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {components.map((comp) => (
                    <ComponentCard key={comp.id} component={comp} userVote={(userVotes[comp.id] as 1 | -1) ?? null} />
                ))}
                {loading && <ComponentGridSkeleton />}
            </div>

            {!loading && components.length === 0 && (
                <EmptyState
                    title={`No ${catInfo?.label?.toLowerCase() || slug} components yet`}
                    description="Be the first to post one!"
                />
            )}

            {!loading && components.length > 0 && (
                <LoadMore count={components.length} hasMore={hasMore} loading={loadingMore} onLoadMore={() => fetchComponents(false)} />
            )}
        </div>
    )
}
