import Link from 'next/link'

interface EmptyStateProps {
    title: string
    description?: string
    actionLabel?: string
    actionHref?: string
    actionIcon?: React.ReactNode
}

export function EmptyState({ title, description, actionLabel, actionHref, actionIcon }: EmptyStateProps) {
    return (
        <div style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            color: 'var(--color-text-tertiary)',
        }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{title}</p>
            {description && (
                <p style={{ fontSize: '0.875rem', marginBottom: actionLabel ? '1.5rem' : '0' }}>
                    {description}
                </p>
            )}
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="transition-base"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.5rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                    }}
                >
                    {actionIcon}
                    {actionLabel}
                </Link>
            )}
        </div>
    )
}
