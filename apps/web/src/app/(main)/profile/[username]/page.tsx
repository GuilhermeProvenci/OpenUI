'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { ComponentCard } from '@/components/ComponentCard'
import { Avatar } from '@/components/Avatar'
import { ComponentGridSkeleton } from '@/components/ComponentGridSkeleton'
import { EmptyState } from '@/components/EmptyState'
import {
    Code2,
    GitFork,
    Star,
    Calendar,
    Archive,
    Trash2,
    RotateCcw,
    Loader2,
    Eye,
    Bookmark,
} from 'lucide-react'
import { formatDate, CATEGORIES } from '@openui/ui'
import { CategoryBadge } from '@/components/CategoryBadge'
import type { ComponentWithAuthor } from '@/types'

type Tab = 'components' | 'forks' | 'archived' | 'saved'
type ProfileSort = 'new' | 'top' | 'views' | 'saves'

export default function ProfilePage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const { username } = use(params)
    const { data: session } = useSession()

    const [components, setComponents] = useState<ComponentWithAuthor[]>([])
    const [savedComponents, setSavedComponents] = useState<ComponentWithAuthor[]>([])
    const [userVotes, setUserVotes] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [profileUser, setProfileUser] = useState<any>(null)
    const [tab, setTab] = useState<Tab>('components')
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [totalViews, setTotalViews] = useState(0)
    const [uniqueViews, setUniqueViews] = useState(0)
    const [profileSort, setProfileSort] = useState<ProfileSort>('new')
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

    const isOwnProfile = session?.user?.id && profileUser?.id === session.user.id

    useEffect(() => {
        async function load() {
            try {
                const params = new URLSearchParams()
                params.set('author', username)
                params.set('sort', 'new')
                params.set('includeArchived', 'true')

                const res = await fetch(`/api/components?${params}`)
                const data = await res.json()
                setComponents(data.items || [])
                setUserVotes(data.userVotes ?? {})
                if (data.profileUser) {
                    setProfileUser(data.profileUser)
                    setTotalViews(data.profileUser.totalViews || 0)
                    setUniqueViews(data.profileUser.uniqueViews || 0)
                }

                if (session?.user?.username === username) {
                    const savedRes = await fetch(`/api/users/me/saved`)
                    if (savedRes.ok) {
                        const savedData = await savedRes.json()
                        setSavedComponents(savedData.items || [])
                        if (savedData.userVotes) {
                            setUserVotes(prev => ({ ...prev, ...savedData.userVotes }))
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load profile', error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [username, session?.user?.id])

    async function handleArchive(componentId: string) {
        setActionLoading(componentId)
        try {
            const res = await fetch(`/api/components/${componentId}`, { method: 'DELETE' })
            if (res.ok) {
                setComponents((prev) => prev.map((c) => c.id === componentId ? { ...c, published: false } : c))
            }
        } catch { /* ignore */ } finally {
            setActionLoading(null)
        }
    }

    async function handleRestore(componentId: string) {
        setActionLoading(componentId)
        try {
            const res = await fetch(`/api/components/${componentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'restore' }),
            })
            if (res.ok) {
                setComponents((prev) => prev.map((c) => c.id === componentId ? { ...c, published: true } : c))
            }
        } catch { /* ignore */ } finally {
            setActionLoading(null)
        }
    }

    const publishedComponents = components.filter((c) => c.published !== false)
    const userOriginals = publishedComponents.filter((c) => !c.forkedFromId)
    const userForks = publishedComponents.filter((c) => c.forkedFromId)
    const archivedComponents = components.filter((c) => c.published === false)
    const totalScore = publishedComponents.reduce((sum, c) => sum + c.voteScore, 0)

    // Get base list for current tab
    const baseComponents = {
        components: userOriginals,
        forks: userForks,
        archived: archivedComponents,
        saved: savedComponents,
    }[tab]

    // Extract unique categories from current tab's components
    const availableCategories = [...new Set(baseComponents.map((c) => c.category))]

    // Apply category filter
    const filteredComponents = categoryFilter
        ? baseComponents.filter((c) => c.category === categoryFilter)
        : baseComponents

    // Apply sorting
    const displayComponents = [...filteredComponents].sort((a, b) => {
        switch (profileSort) {
            case 'top':
                return b.voteScore - a.voteScore
            case 'views':
                return (b.viewCount || 0) - (a.viewCount || 0)
            case 'saves':
                return (b._count?.saves || 0) - (a._count?.saves || 0)
            case 'new':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
    })

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: 'components', label: 'Components', count: userOriginals.length },
        { key: 'forks', label: 'Forks', count: userForks.length },
        ...(isOwnProfile ? [{ key: 'saved' as Tab, label: 'Saved', count: savedComponents.length }] : []),
        ...(isOwnProfile && archivedComponents.length > 0
            ? [{ key: 'archived' as Tab, label: 'Archived', count: archivedComponents.length }]
            : []),
    ]

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Profile Header */}
            <div className="glass" style={{ padding: '2rem', borderRadius: '20px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Avatar src={profileUser?.avatarUrl} alt={username} size={80} fallback={username} />

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {username}
                        {isOwnProfile && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.6875rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--color-brand-light)', fontWeight: 600, verticalAlign: 'middle' }}>
                                YOU
                            </span>
                        )}
                    </h1>

                    {profileUser?.bio && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                            {profileUser.bio}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--color-text-secondary)', fontSize: '0.8125rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Code2 size={14} />{userOriginals.length} components</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><GitFork size={14} />{userForks.length} forks</span>
                        {isOwnProfile && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Eye size={14} />{uniqueViews} unique views</span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Eye size={14} />{totalViews} total views</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Star size={14} />{totalScore} score</span>
                        {profileUser?.createdAt && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={14} />Joined {formatDate(profileUser.createdAt)}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.25rem', borderRadius: '12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', width: 'fit-content' }}>
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className="transition-base"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                            background: tab === t.key ? 'var(--color-bg-elevated)' : 'transparent',
                            color: tab === t.key ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                            fontSize: '0.8125rem', fontWeight: tab === t.key ? 600 : 400, cursor: 'pointer',
                            boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                        }}
                    >
                        {t.key === 'archived' && <Archive size={13} />}
                        {t.key === 'saved' && <Bookmark size={13} />}
                        {t.label} ({t.count})
                    </button>
                ))}
            </div>

            {/* Sort Pills */}
            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {([
                    { key: 'new', label: 'Recent' },
                    { key: 'top', label: 'Most Liked' },
                    { key: 'views', label: 'Most Viewed' },
                    { key: 'saves', label: 'Most Saved' },
                ] as const).map((s) => (
                    <button
                        key={s.key}
                        onClick={() => setProfileSort(s.key)}
                        className="transition-base"
                        style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: profileSort === s.key ? 'var(--color-brand)' : 'var(--color-border)',
                            background: profileSort === s.key ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                            color: profileSort === s.key ? 'var(--color-brand-light)' : 'var(--color-text-tertiary)',
                            fontSize: '0.75rem',
                            fontWeight: profileSort === s.key ? 600 : 400,
                            cursor: 'pointer',
                        }}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Category Filter */}
            {availableCategories.length > 1 && (
                <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setCategoryFilter(null)}
                        className="transition-base"
                        style={{
                            padding: '0.25rem 0.625rem',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: !categoryFilter ? 'var(--color-brand)' : 'var(--color-border)',
                            background: !categoryFilter ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-bg-tertiary)',
                            color: !categoryFilter ? 'var(--color-brand-light)' : 'var(--color-text-secondary)',
                            fontSize: '0.6875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        All
                    </button>
                    {availableCategories.map((cat) => {
                        const catInfo = CATEGORIES.find((c) => c.value === cat)
                        const isSelected = categoryFilter === cat
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(isSelected ? null : cat)}
                                className="transition-base"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.25rem 0.625rem',
                                    borderRadius: '6px',
                                    border: '1px solid',
                                    borderColor: isSelected ? 'var(--color-brand)' : 'var(--color-border)',
                                    background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-bg-tertiary)',
                                    color: isSelected ? 'var(--color-brand-light)' : 'var(--color-text-secondary)',
                                    fontSize: '0.6875rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span>{catInfo?.emoji || '🧩'}</span>
                                <span>{catInfo?.label || cat}</span>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    <ComponentGridSkeleton count={3} />
                </div>
            ) : displayComponents.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                    {displayComponents.map((comp) => (
                        <div key={comp.id} style={{ position: 'relative' }}>
                            {comp.published === false && (
                                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', right: '0.5rem', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0.625rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.9)', backdropFilter: 'blur(4px)', color: 'white', fontSize: '0.6875rem', fontWeight: 600 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Archive size={12} />Archived</span>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRestore(comp.id) }}
                                        disabled={actionLoading === comp.id}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: 'white', fontSize: '0.625rem', cursor: 'pointer' }}
                                    >
                                        {actionLoading === comp.id ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <RotateCcw size={10} />}
                                        Restore
                                    </button>
                                </div>
                            )}

                            <div style={{ opacity: comp.published === false ? 0.5 : 1 }}>
                                <ComponentCard component={comp} userVote={(userVotes[comp.id] as 1 | -1) ?? null} />
                            </div>

                            {isOwnProfile && comp.published !== false && (
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (confirm('Archive this component? It will be hidden from feeds but forks will remain.')) handleArchive(comp.id) }}
                                    disabled={actionLoading === comp.id}
                                    className="transition-base"
                                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.625rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', color: 'var(--color-text-tertiary)', fontSize: '0.6875rem', cursor: 'pointer', opacity: 0 }}
                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.borderColor = 'var(--color-error)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
                                >
                                    {actionLoading === comp.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
                                    Archive
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={tab === 'archived' ? 'No archived components' : tab === 'saved' ? 'No saved components' : `No ${tab === 'forks' ? 'forks' : 'components'} yet`}
                    actionLabel={isOwnProfile && tab === 'components' ? 'Post your first component' : undefined}
                    actionHref={isOwnProfile && tab === 'components' ? '/component/new' : undefined}
                    actionIcon={<Code2 size={16} />}
                />
            )}
        </div>
    )
}
