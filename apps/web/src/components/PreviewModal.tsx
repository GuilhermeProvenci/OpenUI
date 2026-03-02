'use client'

import { useEffect, useCallback } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { buildSandboxHtml } from '@/lib/sandbox'

interface PreviewModalProps {
    title: string
    href: string
    codeJsx?: string | null
    codeHtml?: string | null
    codeCss?: string | null
    codeJs?: string | null
    onClose: () => void
}

export function PreviewModal({ title, href, codeJsx, codeHtml, codeCss, codeJs, onClose }: PreviewModalProps) {
    const srcdoc = buildSandboxHtml({
        mode: codeJsx ? 'jsx' : 'html',
        codeJsx,
        codeHtml,
        codeCss,
        codeJs,
        theme: 'dark',
    })

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
    }, [onClose])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [handleKeyDown])

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                animation: 'fadeIn 0.2s ease-out',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '720px',
                    borderRadius: '20px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
                    overflow: 'hidden',
                    animation: 'scaleIn 0.2s ease-out',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--color-border)',
                }}>
                    <div style={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        minWidth: 0,
                    }}>
                        {title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
                        <a
                            href={href}
                            className="transition-base"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                borderRadius: '8px',
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                textDecoration: 'none',
                            }}
                        >
                            Open
                            <ExternalLink size={12} />
                        </a>
                        <button
                            onClick={onClose}
                            className="transition-base"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-secondary)',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Preview iframe */}
                <div style={{
                    position: 'relative',
                    background: '#0f172a',
                }}>
                    <iframe
                        srcDoc={srcdoc}
                        sandbox="allow-scripts"
                        title={`Preview: ${title}`}
                        style={{
                            display: 'block',
                            width: '100%',
                            height: '420px',
                            border: 'none',
                        }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    )
}
