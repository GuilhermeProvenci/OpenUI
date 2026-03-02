'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ComponentPreview } from '@/components/ComponentPreview'
import { CodeTabEditor } from '@/components/CodeTabEditor'
import { ErrorAlert } from '@/components/ErrorAlert'
import type { CodeTab } from '@/components/CodeTabEditor'
import { CATEGORIES } from '@openui/ui'
import { ArrowLeft, Loader2, Save, GitBranch } from 'lucide-react'

export default function EditComponentPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const { data: session } = useSession()
    const router = useRouter()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [tagsInput, setTagsInput] = useState('')
    const [codeJsx, setCodeJsx] = useState('')
    const [codeHtml, setCodeHtml] = useState('')
    const [codeCss, setCodeCss] = useState('')
    const [codeJs, setCodeJs] = useState('')
    const [activeTab, setActiveTab] = useState<CodeTab>('jsx')
    const [createNewVersion, setCreateNewVersion] = useState(false)
    const [changeNote, setChangeNote] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [currentVersion, setCurrentVersion] = useState(1)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/components/${id}`)
                if (!res.ok) throw new Error()
                const data = await res.json()
                setTitle(data.title)
                setDescription(data.description || '')
                setCategory(data.category)
                setTagsInput(data.tags?.join(', ') || '')
                setCodeJsx(data.codeJsx || '')
                setCodeHtml(data.codeHtml || '')
                setCodeCss(data.codeCss || '')
                setCodeJs(data.codeJs || '')
                if (data.currentVersion) setCurrentVersion(data.currentVersion)
                if (data.codeHtml && !data.codeJsx) setActiveTab('html')
            } catch {
                router.push('/')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id, router])

    const handleSubmit = async () => {
        setError('')
        setSubmitting(true)
        try {
            const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
            const res = await fetch(`/api/components/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    tags,
                    codeJsx: codeJsx || undefined,
                    codeHtml: codeHtml || undefined,
                    codeCss: codeCss || undefined,
                    codeJs: codeJs || undefined,
                    createNewVersion,
                    changeNote: createNewVersion ? changeNote : undefined,
                }),
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'Failed to update')
                return
            }
            router.push(`/component/${id}`)
        } catch {
            setError('Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '400px' }} />
            </div>
        )
    }

    const handleCodeChange = (tab: CodeTab, value: string) => {
        const setters = { jsx: setCodeJsx, html: setCodeHtml, css: setCodeCss, js: setCodeJs }
        setters[tab](value)
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={() => router.back()} style={{ display: 'flex', padding: '0.5rem', borderRadius: '8px', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Edit Component</h1>
                </div>
                <button onClick={handleSubmit} disabled={submitting} className="transition-base" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', borderRadius: '10px', background: submitting ? 'var(--color-bg-tertiary)' : 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                    {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                    {submitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <ErrorAlert message={error} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Component title" style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: '1rem', fontWeight: 500, outline: 'none' }} />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={2} style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1, padding: '0.625rem 0.75rem', borderRadius: '10px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: '0.875rem', outline: 'none' }}>
                            {CATEGORIES.map((cat) => (<option key={cat.value} value={cat.value}>{cat.emoji} {cat.label}</option>))}
                        </select>
                        <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Tags" style={{ flex: 1, padding: '0.625rem 0.75rem', borderRadius: '10px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: '0.875rem', outline: 'none' }} />
                    </div>
                    {/* Version toggle */}
                    <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--color-border)',
                        background: createNewVersion ? 'rgba(99, 102, 241, 0.05)' : 'var(--color-bg-card)',
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625rem',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                        }}>
                            <div
                                onClick={() => setCreateNewVersion(!createNewVersion)}
                                style={{
                                    width: '36px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    background: createNewVersion ? 'var(--color-brand)' : 'var(--color-bg-tertiary)',
                                    border: `1px solid ${createNewVersion ? 'var(--color-brand)' : 'var(--color-border)'}`,
                                    position: 'relative',
                                    transition: 'all 0.2s',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    position: 'absolute',
                                    top: '2px',
                                    left: createNewVersion ? '19px' : '2px',
                                    transition: 'left 0.2s',
                                }} />
                            </div>
                            <GitBranch size={14} style={{ color: createNewVersion ? 'var(--color-brand-light)' : 'var(--color-text-tertiary)' }} />
                            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                Create new version (v{currentVersion + 1})
                            </span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                                {createNewVersion ? 'A new version will be created' : 'Current version will be updated in-place'}
                            </span>
                        </label>
                        {createNewVersion && (
                            <input
                                type="text"
                                value={changeNote}
                                onChange={(e) => setChangeNote(e.target.value)}
                                placeholder={`What changed in v${currentVersion + 1}?`}
                                style={{
                                    marginTop: '0.625rem',
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    background: 'var(--color-bg-tertiary)',
                                    border: '1px solid var(--color-border)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.8125rem',
                                    outline: 'none',
                                }}
                            />
                        )}
                    </div>

                    <CodeTabEditor
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        code={{ jsx: codeJsx, html: codeHtml, css: codeCss, js: codeJs }}
                        onCodeChange={handleCodeChange}
                        height={400}
                    />
                </div>
                <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>Live Preview</h3>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                        <ComponentPreview component={{ codeJsx, codeHtml, codeCss, codeJs }} height={500} />
                    </div>
                </div>
            </div>
        </div>
    )
}
