'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ComponentPreview } from '@/components/ComponentPreview'
import { CodeTabEditor } from '@/components/CodeTabEditor'
import { ErrorAlert } from '@/components/ErrorAlert'
import type { CodeTab } from '@/components/CodeTabEditor'
import { ArrowLeft, Loader2, GitPullRequest } from 'lucide-react'

export default function SuggestPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const { data: session } = useSession()
    const router = useRouter()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [codeJsx, setCodeJsx] = useState('')
    const [codeHtml, setCodeHtml] = useState('')
    const [codeCss, setCodeCss] = useState('')
    const [codeJs, setCodeJs] = useState('')
    const [activeTab, setActiveTab] = useState<CodeTab>('jsx')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [originalTitle, setOriginalTitle] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/components/${id}`)
                if (!res.ok) throw new Error()
                const data = await res.json()
                setOriginalTitle(data.title)
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
        if (!title) { setError('Please provide a title for your suggestion'); return }
        if (!description) { setError('Please describe what you changed'); return }

        setSubmitting(true)
        try {
            const res = await fetch('/api/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    componentId: id,
                    title,
                    description,
                    codeJsx: codeJsx || null,
                    codeHtml: codeHtml || null,
                    codeCss: codeCss || null,
                    codeJs: codeJs || null,
                }),
            })
            if (!res.ok) {
                const data = await res.json()
                setError(data.error || 'Failed to submit suggestion')
                return
            }
            router.push(`/component/${id}`)
        } catch {
            setError('Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    if (!session) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Sign in to suggest changes</h2>
                <a href="/login" style={{ padding: '0.75rem 2rem', borderRadius: '10px', background: 'var(--color-brand)', color: 'white', textDecoration: 'none', fontWeight: 600 }}>Sign In</a>
            </div>
        )
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
                    <div>
                        <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Suggest Changes</h1>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)' }}>to &quot;{originalTitle}&quot;</p>
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={submitting} className="transition-base" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.5rem', borderRadius: '10px', background: submitting ? 'var(--color-bg-tertiary)' : 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))', color: 'white', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                    {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <GitPullRequest size={16} />}
                    {submitting ? 'Submitting...' : 'Submit Suggestion'}
                </button>
            </div>

            <ErrorAlert message={error} />

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Suggestion title (e.g., 'Improve hover animation')" style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: '0.9375rem', outline: 'none' }} />
            </div>

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your changes and why they improve the component..." rows={3} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: '1.5rem' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <CodeTabEditor
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    code={{ jsx: codeJsx, html: codeHtml, css: codeCss, js: codeJs }}
                    onCodeChange={handleCodeChange}
                    height={450}
                />
                <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>Preview with your changes</h3>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                        <ComponentPreview component={{ codeJsx, codeHtml, codeCss, codeJs }} height={500} />
                    </div>
                </div>
            </div>
        </div>
    )
}
