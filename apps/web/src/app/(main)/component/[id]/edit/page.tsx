'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ComponentPreview } from '@/components/ComponentPreview'
import { CATEGORIES } from '@openui/ui'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

const MonacoEditor = dynamic(
    () => import('@monaco-editor/react').then((mod) => mod.default),
    { ssr: false, loading: () => <div className="skeleton" style={{ height: '300px' }} /> }
)

type CodeTab = 'jsx' | 'html' | 'css' | 'js'

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
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

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

    const CODE_TABS: { key: CodeTab; label: string; language: string }[] = [
        { key: 'jsx', label: 'JSX', language: 'javascript' },
        { key: 'html', label: 'HTML', language: 'html' },
        { key: 'css', label: 'CSS', language: 'css' },
        { key: 'js', label: 'JS', language: 'javascript' },
    ]
    const currentCode = { jsx: codeJsx, html: codeHtml, css: codeCss, js: codeJs }
    const setters = { jsx: setCodeJsx, html: setCodeHtml, css: setCodeCss, js: setCodeJs }

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

            {error && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-error)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

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
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-bg-card)' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
                            {CODE_TABS.map((tab) => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: '0.625rem', border: 'none', background: activeTab === tab.key ? 'var(--color-bg-elevated)' : 'transparent', color: activeTab === tab.key ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', fontSize: '0.8125rem', fontWeight: activeTab === tab.key ? 600 : 400, cursor: 'pointer', borderBottom: activeTab === tab.key ? '2px solid var(--color-brand)' : '2px solid transparent' }}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <MonacoEditor height="400px" language={CODE_TABS.find((t) => t.key === activeTab)?.language} value={currentCode[activeTab]} onChange={(val) => setters[activeTab](val || '')} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12 }, automaticLayout: true }} />
                    </div>
                </div>
                <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>Live Preview</h3>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                        <ComponentPreview component={{ codeJsx, codeHtml, codeCss, codeJs }} height={500} />
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
