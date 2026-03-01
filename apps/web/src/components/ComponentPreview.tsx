'use client'

import { buildSandboxHtml } from '@/lib/sandbox'

interface Props {
    component: {
        codeJsx?: string | null
        codeHtml?: string | null
        codeCss?: string | null
        codeJs?: string | null
    }
    mode?: 'jsx' | 'html'
    height?: number
}

export function ComponentPreview({
    component,
    height = 300,
}: Props) {
    const mode = component.codeJsx ? 'jsx' : 'html'
    const srcdoc = buildSandboxHtml({
        mode,
        codeJsx: component.codeJsx,
        codeHtml: component.codeHtml,
        codeCss: component.codeCss,
        codeJs: component.codeJs,
        theme: 'dark',
    })

    return (
        <iframe
            srcDoc={srcdoc}
            sandbox="allow-scripts"
            style={{
                width: '100%',
                height: `${height}px`,
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)',
            }}
            title="Component Preview"
            loading="lazy"
        />
    )
}
