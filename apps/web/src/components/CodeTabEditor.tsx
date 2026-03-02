'use client'

import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(
    () => import('@monaco-editor/react').then((mod) => mod.default),
    { ssr: false, loading: () => <div className="skeleton" style={{ height: '300px' }} /> }
)

type CodeTab = 'jsx' | 'html' | 'css' | 'js'

const CODE_TABS: { key: CodeTab; label: string; language: string }[] = [
    { key: 'jsx', label: 'JSX', language: 'javascript' },
    { key: 'html', label: 'HTML', language: 'html' },
    { key: 'css', label: 'CSS', language: 'css' },
    { key: 'js', label: 'JS', language: 'javascript' },
]

interface CodeTabEditorProps {
    activeTab: CodeTab
    onTabChange: (tab: CodeTab) => void
    code: { jsx: string; html: string; css: string; js: string }
    onCodeChange: (tab: CodeTab, value: string) => void
    height?: string | number
}

export { CODE_TABS }
export type { CodeTab }

export function CodeTabEditor({ activeTab, onTabChange, code, onCodeChange, height = '400px' }: CodeTabEditorProps) {
    return (
        <div style={{
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'var(--color-bg-card)',
        }}>
            <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--color-border)',
            }}>
                {CODE_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => onTabChange(tab.key)}
                        className="transition-base"
                        style={{
                            flex: 1,
                            padding: '0.625rem',
                            border: 'none',
                            background: activeTab === tab.key ? 'var(--color-bg-elevated)' : 'transparent',
                            color: activeTab === tab.key ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                            fontSize: '0.8125rem',
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            cursor: 'pointer',
                            borderBottom: activeTab === tab.key ? '2px solid var(--color-brand)' : '2px solid transparent',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <MonacoEditor
                height={height}
                language={CODE_TABS.find((t) => t.key === activeTab)?.language}
                value={code[activeTab]}
                onChange={(val) => onCodeChange(activeTab, val || '')}
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
    )
}
