'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { ComponentCard } from '@/components/ComponentCard'
import {
    Code2,
    GitFork,
    Star,
    Calendar,
    Archive,
    Trash2,
    RotateCcw,
    Loader2,
} from 'lucide-react'
import { formatDate } from '@openui/ui'
import type { ComponentWithAuthor } from '@/types'

type Tab = 'components' | 'forks' | 'archived'

export default function ProfilePage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const { username } = use(params)
    const { data: session } = useSession()

    const [components, setComponents] = useState<ComponentWithAuthor[]>([])
    const [userVotes, setUserVotes] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [profileUser, setProfileUser] = useState<any>(null)
    const [tab, setTab] = useState<Tab>('components')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const isOwnProfile = session?.user?.id && profileUser?.id === session.user.id

    useEffect(() => {
        async function load() {
            try {
                const params = new URLSearchParams()
                params.set('author', username)
                params.set('sort', 'new')
                // Request archived components too (API will only include them for the owner)
                params.set('includeArchived', 'true')

                const res = await fetch(`/api/components?${params}`)
                const data = await res.json()
                setComponents(data.items || [])
                setUserVotes(data.userVotes ?? {})
                if (data.profileUser) setProfileUser(data.profileUser)
            } catch (error) {
                console.error('Failed to load profile', error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [username])

    async function handleArchive(componentId: string) {
        setActionLoading(componentId)
        try {
            const res = await fetch(`/api/components/${componentId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                setComponents((prev) =>
                    prev.map((c) =>
                        c.id === componentId ? { ...c, published: false } : c
                    )
                )
            }
        } catch {
            // ignore
        } finally {
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
                setComponents((prev) =>
                    prev.map((c) =>
                        c.id === componentId ? { ...c, published: true } : c
                    )
                )
            }
        } catch {
            // ignore
        } finally {
            setActionLoading(null)
        }
    }

    const publishedComponents = components.filter((c) => c.published !== false)
    const userOriginals = publishedComponents.filter((c) => !c.forkedFromId)
    const userForks = publishedComponents.filter((c) => c.forkedFromId)
    const archivedComponents = components.filter((c) => c.published === false)
    const totalScore = publishedComponents.reduce((sum, c) => sum + c.voteScore, 0)

    const displayComponents = {
        components: userOriginals,
        forks: userForks,
        archived: archivedComponents,
    }[tab]

    const tabs: { key: Tab; label: string; count: number; ownerOnly?: boolean }[] = [
        { key: 'components', label: 'Components', count: userOriginals.length },
        { key: 'forks', label: 'Forks', count: userForks.length },
        ...(isOwnProfile && archivedComponents.length > 0
            ? [{ key: 'archived' as Tab, label: 'Archived', count: archivedComponents.length, ownerOnly: true }]
            : []),
    ]

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Profile Header */}
            <div
                className="glass"
                style={{
                    padding: '2rem',
                    borderRadius: '20px',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                }}
            >
                {profileUser?.avatarUrl ? (
                    <img
                        src={profileUser.avatarUrl}
                        alt={username}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            flexShrink: 0,
                            border: '3px solid var(--color-border)',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-brand), var(--color-accent))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: 'white',
                            flexShrink: 0,
                        }}
                    >
                        {username[0]?.toUpperCase() || '?'}
                    </div>
                )}

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {username}
                        {isOwnProfile && (
                            <span
                                style={{
                                    marginLeft: '0.5rem',
                                    fontSize: '0.6875rem',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '4px',
                                    background: 'rgba(99, 102, 241, 0.12)',
                                    color: 'var(--color-brand-light)',
                                    fontWeight: 600,
                                    verticalAlign: 'middle',
                                }}
                            >
                                YOU
                            </span>
                        )}
                    </h1>

                    {profileUser?.bio && (
                        <p
                            style={{
                                fontSize: '0.875rem',
                                color: 'var(--color-text-secondary)',
                                marginBottom: '0.5rem',
                                lineHeight: 1.5,
                            }}
                        >
                            {profileUser.bio}
                        </p>
                    )}

                    <div
                        style={{
                            display: 'flex',
                            gap: '1.25rem',
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.8125rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Code2 size={14} />
                            {userOriginals.length} components
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <GitFork size={14} />
                            {userForks.length} forks
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Star size={14} />
                            {totalScore} score
                        </span>
                        {profileUser?.createdAt && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <Calendar size={14} />
                                Joined {formatDate(profileUser.createdAt)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
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
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className="transition-base"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: tab === t.key ? 'var(--color-bg-elevated)' : 'transparent',
                            color: tab === t.key ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                            fontSize: '0.8125rem',
                            fontWeight: tab === t.key ? 600 : 400,
                            cursor: 'pointer',
                            boxShadow: tab === t.key ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                        }}
                    >
                        {t.key === 'archived' && <Archive size={13} />}
                        {t.label} ({t.count})
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.25rem',
                    }}
                >
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
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
            ) : displayComponents.length > 0 ? (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.25rem',
                    }}
                >
                    {displayComponents.map((comp) => (
                        <div key={comp.id} style={{ position: 'relative' }}>
                            {/* Archived overlay */}
                            {comp.published === false && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        left: '0.5rem',
                                        right: '0.5rem',
                                        zIndex: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.375rem 0.625rem',
                                        borderRadius: '8px',
                                        background: 'rgba(239, 68, 68, 0.9)',
                                        backdropFilter: 'blur(4px)',
                                        color: 'white',
                                        fontSize: '0.6875rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Archive size={12} />
                                        Archived
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleRestore(comp.id)
                                        }}
                                        disabled={actionLoading === comp.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            border: '1px solid rgba(255,255,255,0.4)',
                                            background: 'transparent',
                                            color: 'white',
                                            fontSize: '0.625rem',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {actionLoading === comp.id
                                            ? <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />
                                            : <RotateCcw size={10} />
                                        }
                                        Restore
                                    </button>
                                </div>
                            )}

                            <div style={{ opacity: comp.published === false ? 0.5 : 1 }}>
                                <ComponentCard
                                    component={comp}
                                    userVote={(userVotes[comp.id] as 1 | -1) ?? null}
                                />
                            </div>

                            {/* Delete button for own published components */}
                            {isOwnProfile && comp.published !== false && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (confirm('Archive this component? It will be hidden from feeds but forks will remain.')) {
                                            handleArchive(comp.id)
                                        }
                                    }}
                                    disabled={actionLoading === comp.id}
                                    className="transition-base"
                                    style={{
                                        position: 'absolute',
                                        top: '0.5rem',
                                        right: '0.5rem',
                                        zIndex: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.35rem 0.625rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-bg-card)',
                                        color: 'var(--color-text-tertiary)',
                                        fontSize: '0.6875rem',
                                        cursor: 'pointer',
                                        opacity: 0,
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.borderColor = 'var(--color-error)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
                                >
                                    {actionLoading === comp.id
                                        ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                        : <Trash2 size={12} />
                                    }
                                    Archive
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    style={{
                        textAlign: 'center',
                        padding: '4rem 1rem',
                        color: 'var(--color-text-tertiary)',
                    }}
                >
                    {tab === 'archived' ? (
                        <p style={{ fontSize: '1.125rem' }}>No archived components</p>
                    ) : (
                        <>
                            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                                No {tab === 'forks' ? 'forks' : 'components'} yet
                            </p>
                            {isOwnProfile && tab === 'components' && (
                                <a
                                    href="/component/new"
                                    className="transition-base"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginTop: '1rem',
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
                                    Post your first component
                                </a>
                            )}
                        </>
                    )}
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
