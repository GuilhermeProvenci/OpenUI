'use client'

import { useState, useEffect, use } from 'react'
import { ComponentCard } from '@/components/ComponentCard'
import { Code2, GitFork, Star } from 'lucide-react'
import type { ComponentWithAuthor } from '@/types'

export default function ProfilePage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const { username } = use(params)
    const [components, setComponents] = useState<ComponentWithAuthor[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [tab, setTab] = useState<'components' | 'forks'>('components')

    useEffect(() => {
        async function load() {
            try {
                // Fetch user's components
                const res = await fetch(`/api/components?author=${username}`)
                const data = await res.json()
                setComponents(data.items || [])
            } catch (error) {
                console.error('Failed to load profile', error)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [username])

    const userComponents = components.filter((c) => !c.forkedFromId)
    const userForks = components.filter((c) => c.forkedFromId)
    const displayComponents = tab === 'components' ? userComponents : userForks
    const totalScore = components.reduce((sum, c) => sum + c.voteScore, 0)

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

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {username}
                    </h1>
                    <div
                        style={{
                            display: 'flex',
                            gap: '1.5rem',
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.875rem',
                        }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Code2 size={15} />
                            {components.length} components
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <GitFork size={15} />
                            {userForks.length} forks
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Star size={15} />
                            {totalScore} score
                        </span>
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
                <button
                    onClick={() => setTab('components')}
                    className="transition-base"
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: tab === 'components' ? 'var(--color-bg-elevated)' : 'transparent',
                        color: tab === 'components' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                        fontSize: '0.8125rem',
                        fontWeight: tab === 'components' ? 600 : 400,
                        cursor: 'pointer',
                    }}
                >
                    Components ({userComponents.length})
                </button>
                <button
                    onClick={() => setTab('forks')}
                    className="transition-base"
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: tab === 'forks' ? 'var(--color-bg-elevated)' : 'transparent',
                        color: tab === 'forks' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                        fontSize: '0.8125rem',
                        fontWeight: tab === 'forks' ? 600 : 400,
                        cursor: 'pointer',
                    }}
                >
                    Forks ({userForks.length})
                </button>
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
                        <ComponentCard key={comp.id} component={comp} />
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
                    <p style={{ fontSize: '1.125rem' }}>
                        No {tab === 'forks' ? 'forks' : 'components'} yet
                    </p>
                </div>
            )}
        </div>
    )
}
