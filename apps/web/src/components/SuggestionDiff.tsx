'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Code2 } from 'lucide-react'

const ReactDiffViewer = dynamic(() => import('react-diff-viewer-continued'), {
    ssr: false,
    loading: () => <div className="skeleton" style={{ height: '200px' }} />,
})

type CodeField = 'jsx' | 'html' | 'css' | 'js'

interface Props {
    original: {
        codeJsx?: string | null
        codeHtml?: string | null
        codeCss?: string | null
        codeJs?: string | null
    }
    suggestion: {
        codeJsx?: string | null
        codeHtml?: string | null
        codeCss?: string | null
        codeJs?: string | null
    }
}

const FIELD_MAP: { key: CodeField; label: string; origKey: keyof Props['original']; sugKey: keyof Props['suggestion'] }[] = [
    { key: 'jsx', label: 'JSX', origKey: 'codeJsx', sugKey: 'codeJsx' },
    { key: 'html', label: 'HTML', origKey: 'codeHtml', sugKey: 'codeHtml' },
    { key: 'css', label: 'CSS', origKey: 'codeCss', sugKey: 'codeCss' },
    { key: 'js', label: 'JS', origKey: 'codeJs', sugKey: 'codeJs' },
]

export function SuggestionDiff({ original, suggestion }: Props) {
    // Find fields that actually changed
    const changedFields = FIELD_MAP.filter((f) => {
        const sugValue = suggestion[f.sugKey]
        const origValue = original[f.origKey]
        return sugValue !== null && sugValue !== undefined && sugValue !== (origValue ?? '')
    })

    const [activeField, setActiveField] = useState<CodeField>(
        changedFields[0]?.key ?? 'jsx'
    )

    if (changedFields.length === 0) {
        return (
            <div style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                No code changes in this suggestion.
            </div>
        )
    }

    const currentField = changedFields.find((f) => f.key === activeField) ?? changedFields[0]
    const oldCode = (original[currentField.origKey] as string) ?? ''
    const newCode = (suggestion[currentField.sugKey] as string) ?? oldCode

    return (
        <div
            style={{
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                overflow: 'hidden',
                marginTop: '0.75rem',
            }}
        >
            {/* Tabs for changed fields */}
            <div
                style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                }}
            >
                {changedFields.map((field) => (
                    <button
                        key={field.key}
                        onClick={() => setActiveField(field.key)}
                        className="transition-base"
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            background: activeField === field.key ? 'var(--color-bg-elevated)' : 'transparent',
                            color: activeField === field.key ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                            fontSize: '0.75rem',
                            fontWeight: activeField === field.key ? 600 : 400,
                            cursor: 'pointer',
                            borderBottom: activeField === field.key ? '2px solid var(--color-brand)' : '2px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                        }}
                    >
                        <Code2 size={12} />
                        {field.label}
                    </button>
                ))}
            </div>

            {/* Diff viewer */}
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                <ReactDiffViewer
                    oldValue={oldCode}
                    newValue={newCode}
                    splitView={true}
                    leftTitle="Current code"
                    rightTitle="Suggested change"
                    useDarkTheme={true}
                    styles={{
                        contentText: {
                            fontSize: '0.75rem',
                            lineHeight: '1.5',
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        },
                    }}
                />
            </div>
        </div>
    )
}
