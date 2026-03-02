'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Eye } from 'lucide-react'
import { PreviewModal } from '@/components/PreviewModal'

interface PreviewButtonProps {
    title: string
    href: string
    codeJsx?: string | null
    codeHtml?: string | null
    codeCss?: string | null
    codeJs?: string | null
    size?: number
    light?: boolean
}

export function PreviewButton({ title, href, codeJsx, codeHtml, codeCss, codeJs, size = 14, light }: PreviewButtonProps) {
    const [showPreview, setShowPreview] = useState(false)

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowPreview(true)
                }}
                className="transition-base"
                title="Quick preview"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: light ? 'rgba(255,255,255,0.08)' : 'var(--color-bg-tertiary)',
                    border: `1px solid ${light ? 'rgba(255,255,255,0.12)' : 'var(--color-border)'}`,
                    color: light ? 'rgba(255,255,255,0.5)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    flexShrink: 0,
                }}
            >
                <Eye size={size} />
            </button>
            {showPreview && typeof document !== 'undefined' && createPortal(
                <PreviewModal
                    title={title}
                    href={href}
                    codeJsx={codeJsx}
                    codeHtml={codeHtml}
                    codeCss={codeCss}
                    codeJs={codeJs}
                    onClose={() => setShowPreview(false)}
                />,
                document.body
            )}
        </>
    )
}
