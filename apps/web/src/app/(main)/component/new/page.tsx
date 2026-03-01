'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { ComponentPreview } from '@/components/ComponentPreview'
import { CATEGORIES } from '@openui/ui'
import { ArrowLeft, Eye, Code2, Loader2 } from 'lucide-react'

// Dynamic import for Monaco Editor (client-side only)
const MonacoEditor = dynamic(
    () => import('@monaco-editor/react').then((mod) => mod.default),
    { ssr: false, loading: () => <div className="skeleton" style={{ height: '300px' }} /> }
)

type CodeTab = 'jsx' | 'html' | 'css' | 'js'

export default function NewComponentPage() {
    const { data: session } = useSession()
    const router = useRouter()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [tagsInput, setTagsInput] = useState('')
    const [codeJsx, setCodeJsx] = useState(
        `// Your component must export an App function\nfunction App() {\n  return (\n    <button\n      style={{\n        padding: '12px 24px',\n        borderRadius: '8px',\n        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',\n        color: 'white',\n        border: 'none',\n        fontSize: '16px',\n        fontWeight: 600,\n        cursor: 'pointer',\n      }}\n    >\n      Click me\n    </button>\n  )\n}`
    )
    const [codeHtml, setCodeHtml] = useState('')
    const [codeCss, setCodeCss] = useState('')
    const [codeJs, setCodeJs] = useState('')
    const [activeTab, setActiveTab] = useState<CodeTab>('jsx')
    const [showPreview, setShowPreview] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const codeMode = codeJsx ? 'jsx' : 'html'

    const handleSubmit = async () => {
        setError('')

        if (!title || title.length < 3) {
            setError('Title must be at least 3 characters')
            return
        }
        if (!category) {
            setError('Please select a category')
            return
        }
        if (!codeJsx && !codeHtml) {
            setError('Please add some code (JSX or HTML)')
            return
        }

        setSubmitting(true)
        try {
            const tags = tagsInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)

            const res = await fetch('/api/components', {
                method: 'POST',
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
                setError(data.error || 'Failed to create component')
                return
            }

            const data = await res.json()
            router.push(`/component/${data.id}`)
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (!session) {
        return (
            <div
                style={{
                    maxWidth: '600px',
                    margin: '4rem auto',
                    textAlign: 'center',
                    padding: '2rem',
                }}
            >
                <h2 style={{ marginBottom: '1rem' }}>Sign in to post a component</h2>
                <a
                    href="/login"
                    style={{
                        padding: '0.75rem 2rem',
                        borderRadius: '10px',
                        background: 'var(--color-brand)',
                        color: 'white',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}
                >
                    Sign In
                </a>
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
        <div
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '1.5rem 1rem',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1
                        style={{
                            fontSize: '1.375rem',
                            fontWeight: 700,
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Post a new component
                    </h1>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="transition-base"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.5rem',
                        borderRadius: '10px',
                        background: submitting
                            ? 'var(--color-bg-tertiary)'
                            : 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
                    }}
                >
                    {submitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                    {submitting ? 'Publishing...' : 'Publish'}
                </button>
            </div>

            {error && (
                <div
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'var(--color-error)',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem',
                }}
            >
                {/* Left: Form + Code */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}
                >
                    {/* Title */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Component title"
                        maxLength={80}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            background: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            fontSize: '1rem',
                            fontWeight: 500,
                            outline: 'none',
                        }}
                    />

                    {/* Description */}
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description (optional)"
                        rows={2}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            background: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            fontSize: '0.875rem',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                        }}
                    />

                    {/* Category & Tags */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '0.625rem 0.75rem',
                                borderRadius: '10px',
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                color: category
                                    ? 'var(--color-text-primary)'
                                    : 'var(--color-text-tertiary)',
                                fontSize: '0.875rem',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.emoji} {cat.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="Tags (comma-separated)"
                            style={{
                                flex: 1,
                                padding: '0.625rem 0.75rem',
                                borderRadius: '10px',
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Code Tabs */}
                    <div
                        style={{
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            background: 'var(--color-bg-card)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                borderBottom: '1px solid var(--color-border)',
                            }}
                        >
                            {CODE_TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className="transition-base"
                                    style={{
                                        flex: 1,
                                        padding: '0.625rem',
                                        border: 'none',
                                        background:
                                            activeTab === tab.key
                                                ? 'var(--color-bg-elevated)'
                                                : 'transparent',
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
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <MonacoEditor
                            height="400px"
                            language={CODE_TABS.find((t) => t.key === activeTab)?.language}
                            value={currentCode[activeTab]}
                            onChange={(val) => setters[activeTab](val || '')}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                padding: { top: 12 },
                                automaticLayout: true,
                            }}
                        />
                    </div>
                </div>

                {/* Right: Preview */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <h3
                            style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'var(--color-text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                            }}
                        >
                            <Eye size={15} />
                            Live Preview
                        </h3>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="transition-base"
                            style={{
                                padding: '0.35rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid var(--color-border)',
                                background: 'transparent',
                                color: 'var(--color-text-tertiary)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                            }}
                        >
                            {showPreview ? 'Hide' : 'Show'} Preview
                        </button>
                    </div>

                    {showPreview && (
                        <div
                            style={{
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                background: 'var(--color-bg-card)',
                            }}
                        >
                            <ComponentPreview
                                component={{ codeJsx, codeHtml, codeCss, codeJs }}
                                height={500}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    )
}
