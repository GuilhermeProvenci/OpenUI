import type { ReactNode } from 'react'

interface FeatureCardProps {
    icon: ReactNode
    title: string
    description: string
    color: string
    bg: string
}

export function FeatureCard({ icon, title, description, color, bg }: FeatureCardProps) {
    return (
        <div style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--color-border)', background: 'var(--color-bg-card)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '12px', background: bg, color, marginBottom: '0.875rem' }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-primary)' }}>{title}</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{description}</p>
        </div>
    )
}
