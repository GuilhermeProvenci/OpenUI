'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ComponentPreview } from '@/components/ComponentPreview'
import { VoteButton } from '@/components/VoteButton'
import { CategoryBadge } from '@/components/CategoryBadge'
import { formatDate, downloadCode } from '@openui/ui'
import { SuggestionDiff } from '@/components/SuggestionDiff'
import {
    GitFork,
    MessageSquare,
    Download,
    Share2,
    Code2,
    Eye,
    Edit,
    ExternalLink,
    Check,
    X,
    ChevronDown,
    ChevronRight,
    History,
    Archive,
    Bookmark,
} from 'lucide-react'

type CodeTab = 'preview' | 'jsx' | 'html' | 'css' | 'js'

export default function ComponentDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const { data: session } = useSession()
    const router = useRouter()

    const [component, setComponent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [removed, setRemoved] = useState(false)
    const [activeTab, setActiveTab] = useState<CodeTab>('preview')
    const [forking, setForking] = useState(false)
    const [expandedDiffs, setExpandedDiffs] = useState<Set<string>>(new Set())
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
    const [versionCode, setVersionCode] = useState<any>(null)
    const [loadingVersion, setLoadingVersion] = useState(false)
    const [archiving, setArchiving] = useState(false)
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/components/${id}`)
                if (res.status === 410) {
                    setRemoved(true)
                    return
                }
                if (!res.ok) throw new Error('Not found')
                const data = await res.json()
                setComponent(data)

                fetch(`/api/components/${id}/view`, { method: 'POST' })
                    .then(res => res.ok ? res.json() : null)
                    .then(viewData => {
                        if (viewData) {
                            setComponent((c: any) => c ? { ...c, viewCount: viewData.viewCount } : c)
                        }
                    })
                    .catch(() => {})

                fetch(`/api/components/${id}/save`)
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (data) setSaved(data.saved)
                    })
                    .catch(() => {})
            } catch {
                router.push('/')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id, router])

    function toggleDiff(sugId: string) {
        setExpandedDiffs((prev) => {
            const next = new Set(prev)
            if (next.has(sugId)) next.delete(sugId)
            else next.add(sugId)
            return next
        })
    }

    async function loadVersion(version: number) {
        if (selectedVersion === version) {
            // Deselect — go back to current
            setSelectedVersion(null)
            setVersionCode(null)
            return
        }
        setLoadingVersion(true)
        try {
            const res = await fetch(`/api/components/${id}/versions/${version}`)
            if (res.ok) {
                const data = await res.json()
                setVersionCode(data)
                setSelectedVersion(version)
            }
        } catch {
            // ignore
        } finally {
            setLoadingVersion(false)
        }
    }

    async function handleArchive() {
        setArchiving(true)
        try {
            const res = await fetch(`/api/components/${id}`, { method: 'DELETE' })
            if (res.ok) {
                router.push(`/profile/${component?.author?.username || 'me'}`)
            }
        } catch {
            alert('Failed to archive component')
        } finally {
            setArchiving(false)
            setShowArchiveConfirm(false)
        }
    }

    async function handleFork() {
        if (!session) {
            router.push('/login')
            return
        }
        setForking(true)
        try {
            const res = await fetch(`/api/components/${id}/fork`, {
                method: 'POST',
            })
            const data = await res.json()
            if (data.id) {
                router.push(`/component/${data.id}/edit`)
            }
        } catch {
            alert('Failed to fork component')
        } finally {
            setForking(false)
        }
    }

    async function handleSave() {
        if (!session) {
            router.push('/login')
            return
        }
        setSaving(true)
        try {
            const res = await fetch(`/api/components/${id}/save`, { method: 'POST' })
            const data = await res.json()
            setSaved(data.saved)
        } catch {
            alert('Failed to save component')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div className="skeleton" style={{ height: '32px', width: '300px', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '400px', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '16px', width: '200px' }} />
            </div>
        )
    }

    if (removed) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
                <Archive size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Component Removed
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                    This component was archived by its author.
                </p>
                <a
                    href="/"
                    style={{
                        padding: '0.625rem 1.5rem',
                        borderRadius: '10px',
                        background: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-primary)',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                    }}
                >
                    Back to feed
                </a>
            </div>
        )
    }

    if (!component) return null

    const isAuthor = session?.user?.id === component.author?.id

    const codeTabs = ([
        { key: 'preview', label: 'Preview', hasContent: true },
        { key: 'jsx', label: 'JSX', hasContent: !!component.codeJsx },
        { key: 'html', label: 'HTML', hasContent: !!component.codeHtml },
        { key: 'css', label: 'CSS', hasContent: !!component.codeCss },
        { key: 'js', label: 'JS', hasContent: !!component.codeJs },
    ] as { key: CodeTab; label: string; hasContent: boolean }[]).filter((t) => t.hasContent)

    // Use version code if a specific version is selected, otherwise current
    const displayCode = selectedVersion && versionCode
        ? versionCode
        : component

    const codeMap: Record<string, string | null> = {
        jsx: displayCode.codeJsx,
        html: displayCode.codeHtml,
        css: displayCode.codeCss,
        js: displayCode.codeJs,
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                }}
            >
                <VoteButton
                    componentId={component.id}
                    initialScore={component.voteScore}
                    initialUserVote={component.userVote}
                />

                <div style={{ flex: 1 }}>
                    <h1
                        style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            letterSpacing: '-0.5px',
                            marginBottom: '0.5rem',
                        }}
                    >
                        {component.title}
                    </h1>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            flexWrap: 'wrap',
                            marginBottom: '0.5rem',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            {component.author.avatarUrl && (
                                <img
                                    src={component.author.avatarUrl}
                                    alt=""
                                    style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                                />
                            )}
                            <a
                                href={`/profile/${component.author.username}`}
                                style={{
                                    color: 'var(--color-text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                }}
                            >
                                {component.author.username}
                            </a>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {formatDate(component.createdAt)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Eye size={12} />
                            {component.viewCount || 0} views
                        </span>
                        <CategoryBadge category={component.category} size="md" />
                    </div>

                    {component.description && (
                        <p
                            style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.9375rem',
                                lineHeight: 1.5,
                                marginBottom: '0.5rem',
                            }}
                        >
                            {component.description}
                        </p>
                    )}

                    {/* Tags */}
                    {component.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                            {component.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    style={{
                                        fontSize: '0.75rem',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        color: 'var(--color-brand-light)',
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Forked from */}
                    {component.forkedFrom && (
                        <div
                            style={{
                                marginTop: '0.5rem',
                                fontSize: '0.8125rem',
                                color: 'var(--color-text-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                            }}
                        >
                            <GitFork size={14} />
                            Forked from{' '}
                            <a
                                href={`/component/${component.forkedFrom.id}`}
                                style={{ color: 'var(--color-brand-light)', textDecoration: 'none' }}
                            >
                                {component.forkedFrom.title}
                            </a>
                            <span> by <a href={`/profile/${component.forkedFrom.author.username}`} style={{ color: 'var(--color-brand-light)', textDecoration: 'none' }}>{component.forkedFrom.author.username}</a></span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    {isAuthor && (
                        <>
                            <a
                                href={`/component/${id}/edit`}
                                className="transition-base"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    padding: '0.5rem 0.875rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)',
                                    background: 'transparent',
                                    color: 'var(--color-text-secondary)',
                                    textDecoration: 'none',
                                    fontSize: '0.8125rem',
                                }}
                            >
                                <Edit size={14} />
                                Edit
                            </a>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowArchiveConfirm(!showArchiveConfirm)}
                                    className="transition-base"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        padding: '0.5rem 0.875rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border)',
                                        background: 'transparent',
                                        color: 'var(--color-text-tertiary)',
                                        fontSize: '0.8125rem',
                                        cursor: 'pointer',
                                    }}
                                    title="Archive this component"
                                >
                                    <Archive size={14} />
                                    Archive
                                </button>
                                {showArchiveConfirm && (
                                    <>
                                        <div
                                            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                            onClick={() => setShowArchiveConfirm(false)}
                                        />
                                        <div
                                            className="glass"
                                            style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                marginTop: '0.5rem',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                minWidth: '260px',
                                                zIndex: 50,
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                            }}
                                        >
                                            <p style={{
                                                fontSize: '0.8125rem',
                                                color: 'var(--color-text-secondary)',
                                                marginBottom: '0.75rem',
                                                lineHeight: 1.4,
                                            }}>
                                                Archive this component? It will be hidden from the feed but forks and votes are preserved. You can restore it later from your profile.
                                            </p>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => setShowArchiveConfirm(false)}
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--color-border)',
                                                        background: 'transparent',
                                                        color: 'var(--color-text-secondary)',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleArchive}
                                                    disabled={archiving}
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        borderRadius: '6px',
                                                        border: '1px solid var(--color-error)',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: 'var(--color-error)',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        cursor: archiving ? 'not-allowed' : 'pointer',
                                                    }}
                                                >
                                                    {archiving ? 'Archiving...' : 'Yes, archive'}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                    <button
                        onClick={handleFork}
                        disabled={forking}
                        className="transition-base"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 0.875rem',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            background: 'transparent',
                            color: 'var(--color-text-secondary)',
                            fontSize: '0.8125rem',
                            cursor: forking ? 'not-allowed' : 'pointer',
                            opacity: forking ? 0.6 : 1,
                        }}
                    >
                        <GitFork size={14} />
                        Fork ({component._count.forks})
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="transition-base"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 0.875rem',
                            borderRadius: '8px',
                            border: '1px solid var(--color-border)',
                            background: saved ? 'var(--color-brand)' : 'transparent',
                            color: saved ? 'white' : 'var(--color-text-secondary)',
                            fontSize: '0.8125rem',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.6 : 1,
                        }}
                    >
                        <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
                        {saved ? 'Saved' : 'Save'}
                    </button>
                    <a
                        href={`/component/${id}/suggest`}
                        className="transition-base"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 0.875rem',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                        }}
                    >
                        <MessageSquare size={14} />
                        Suggest
                    </a>
                </div>
            </div>

            {/* Version indicator */}
            {selectedVersion && (
                <div
                    style={{
                        padding: '0.625rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        color: 'var(--color-brand-light)',
                        fontSize: '0.8125rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <span>
                        <History size={14} style={{ verticalAlign: 'middle', marginRight: '0.375rem' }} />
                        Viewing version {selectedVersion}
                        {versionCode?.changeNote && ` — ${versionCode.changeNote}`}
                    </span>
                    <button
                        onClick={() => { setSelectedVersion(null); setVersionCode(null) }}
                        style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid var(--color-brand-light)',
                            background: 'transparent',
                            color: 'var(--color-brand-light)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                        }}
                    >
                        Back to latest
                    </button>
                </div>
            )}

            {/* Code Tabs & Preview */}
            <div
                style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'var(--color-bg-card)',
                    marginBottom: '2rem',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        borderBottom: '1px solid var(--color-border)',
                        overflowX: 'auto',
                    }}
                >
                    {codeTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="transition-base"
                            style={{
                                padding: '0.75rem 1.25rem',
                                border: 'none',
                                background:
                                    activeTab === tab.key ? 'var(--color-bg-elevated)' : 'transparent',
                                color:
                                    activeTab === tab.key
                                        ? 'var(--color-text-primary)'
                                        : 'var(--color-text-tertiary)',
                                fontSize: '0.8125rem',
                                fontWeight: activeTab === tab.key ? 600 : 400,
                                cursor: 'pointer',
                                borderBottom:
                                    activeTab === tab.key
                                        ? '2px solid var(--color-brand)'
                                        : '2px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {tab.key === 'preview' ? <Eye size={14} /> : <Code2 size={14} />}
                            {tab.label}
                        </button>
                    ))}

                    {/* Download button for code tabs */}
                    {activeTab !== 'preview' && codeMap[activeTab] && (
                        <button
                            onClick={() =>
                                downloadCode(
                                    `${component.title}.${activeTab === 'jsx' ? 'jsx' : activeTab}`,
                                    codeMap[activeTab]!
                                )
                            }
                            className="transition-base"
                            style={{
                                marginLeft: 'auto',
                                padding: '0.75rem 1rem',
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--color-text-tertiary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                            }}
                        >
                            <Download size={14} />
                            Download
                        </button>
                    )}
                </div>

                {/* Content */}
                {activeTab === 'preview' ? (
                    <ComponentPreview component={displayCode} height={450} />
                ) : (
                    <pre
                        style={{
                            padding: '1.5rem',
                            margin: 0,
                            overflow: 'auto',
                            maxHeight: '500px',
                            fontSize: '0.8125rem',
                            lineHeight: 1.6,
                            color: 'var(--color-text-primary)',
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        }}
                    >
                        <code>{codeMap[activeTab] || ''}</code>
                    </pre>
                )}
            </div>

            {/* Suggestions Section */}
            {component.suggestions?.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <MessageSquare size={18} />
                        Suggestions ({component._count.suggestions})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {component.suggestions.map((sug: any) => (
                            <div
                                key={sug.id}
                                className="card-hover"
                                style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-card)',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                        }}
                                    >
                                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                                            {sug.title}
                                        </h3>
                                        <span
                                            style={{
                                                fontSize: '0.6875rem',
                                                padding: '0.15rem 0.5rem',
                                                borderRadius: '4px',
                                                fontWeight: 600,
                                                background:
                                                    sug.status === 'ACCEPTED'
                                                        ? 'rgba(34, 197, 94, 0.15)'
                                                        : sug.status === 'REJECTED'
                                                            ? 'rgba(239, 68, 68, 0.15)'
                                                            : 'rgba(245, 158, 11, 0.15)',
                                                color:
                                                    sug.status === 'ACCEPTED'
                                                        ? 'var(--color-success)'
                                                        : sug.status === 'REJECTED'
                                                            ? 'var(--color-error)'
                                                            : 'var(--color-accent)',
                                            }}
                                        >
                                            {sug.status}
                                        </span>
                                    </div>

                                    {isAuthor && sug.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                                            <button
                                                onClick={async () => {
                                                    await fetch(`/api/suggestions/${sug.id}/accept`, {
                                                        method: 'POST',
                                                    })
                                                    window.location.reload()
                                                }}
                                                className="transition-base"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.35rem 0.625rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--color-success)',
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    color: 'var(--color-success)',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Check size={12} /> Accept
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    await fetch(`/api/suggestions/${sug.id}/reject`, {
                                                        method: 'POST',
                                                    })
                                                    window.location.reload()
                                                }}
                                                className="transition-base"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    padding: '0.35rem 0.625rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--color-error)',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: 'var(--color-error)',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <X size={12} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <p
                                    style={{
                                        fontSize: '0.8125rem',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '0.5rem',
                                    }}
                                >
                                    {sug.description}
                                </p>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: 'var(--color-text-muted)',
                                    }}
                                >
                                    <a
                                        href={`/profile/${sug.author.username}`}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none', color: 'inherit' }}
                                    >
                                        {sug.author.avatarUrl && (
                                            <img
                                                src={sug.author.avatarUrl}
                                                alt=""
                                                style={{ width: '16px', height: '16px', borderRadius: '50%' }}
                                            />
                                        )}
                                        <span>{sug.author.username}</span>
                                    </a>
                                    <span>· {formatDate(sug.createdAt)}</span>
                                    <button
                                        onClick={() => toggleDiff(sug.id)}
                                        className="transition-base"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            marginLeft: '0.5rem',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            border: '1px solid var(--color-border)',
                                            background: expandedDiffs.has(sug.id) ? 'var(--color-bg-elevated)' : 'transparent',
                                            color: 'var(--color-text-secondary)',
                                            fontSize: '0.6875rem',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {expandedDiffs.has(sug.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                        View Diff
                                    </button>
                                </div>

                                {/* Expandable diff */}
                                {expandedDiffs.has(sug.id) && (
                                    <SuggestionDiff
                                        original={component}
                                        suggestion={sug}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Version History */}
            {component.versions?.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h2
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <History size={18} />
                        Versions ({component.versions.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {component.versions.map((ver: any) => {
                            const isCurrent = ver.version === component.currentVersion
                            const isSelected = selectedVersion === ver.version
                            return (
                                <button
                                    key={ver.id}
                                    onClick={() => {
                                        if (isCurrent) {
                                            setSelectedVersion(null)
                                            setVersionCode(null)
                                        } else {
                                            loadVersion(ver.version)
                                        }
                                    }}
                                    disabled={loadingVersion}
                                    className="transition-base"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '10px',
                                        border: isSelected
                                            ? '1px solid var(--color-brand)'
                                            : '1px solid var(--color-border)',
                                        background: isSelected
                                            ? 'rgba(99, 102, 241, 0.08)'
                                            : 'var(--color-bg-card)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                    }}
                                >
                                    <span
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: isCurrent
                                                ? 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))'
                                                : 'var(--color-bg-tertiary)',
                                            color: isCurrent ? 'white' : 'var(--color-text-secondary)',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}
                                    >
                                        v{ver.version}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: '0.8125rem',
                                                fontWeight: 500,
                                                color: 'var(--color-text-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                            }}
                                        >
                                            {ver.changeNote || `Version ${ver.version}`}
                                            {isCurrent && (
                                                <span
                                                    style={{
                                                        fontSize: '0.625rem',
                                                        padding: '0.1rem 0.4rem',
                                                        borderRadius: '4px',
                                                        background: 'rgba(34, 197, 94, 0.15)',
                                                        color: 'var(--color-success)',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    CURRENT
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.6875rem',
                                                color: 'var(--color-text-muted)',
                                                marginTop: '0.125rem',
                                            }}
                                        >
                                            {formatDate(ver.createdAt)}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Forks Section */}
            {component.forks?.length > 0 && (
                <div>
                    <h2
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}
                    >
                        <GitFork size={18} />
                        Forks ({component._count.forks})
                    </h2>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '0.75rem',
                        }}
                    >
                        {component.forks.map((fork: any) => (
                            <a
                                key={fork.id}
                                href={`/component/${fork.id}`}
                                className="card-hover"
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg-card)',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                }}
                            >
                                {fork.author.avatarUrl && (
                                    <img
                                        src={fork.author.avatarUrl}
                                        alt=""
                                        style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                    />
                                )}
                                <div>
                                    <div
                                        style={{
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: 'var(--color-text-primary)',
                                        }}
                                    >
                                        {fork.title}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        by <span
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/profile/${fork.author.username}` }}
                                            style={{ color: 'var(--color-brand-light)', cursor: 'pointer' }}
                                        >{fork.author.username}</span>
                                    </div>
                                </div>
                                <ExternalLink
                                    size={14}
                                    style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}
                                />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
