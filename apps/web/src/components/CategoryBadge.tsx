import Link from 'next/link'
import { Category } from '@openui/database'
import { CATEGORIES } from '@openui/ui'

interface Props {
    category: Category
    size?: 'sm' | 'md'
}

export function CategoryBadge({ category, size = 'sm' }: Props) {
    const cat = CATEGORIES.find((c) => c.value === category)
    const isSmall = size === 'sm'

    return (
        <Link
            href={`/${category.toLowerCase()}`}
            className="transition-base"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: isSmall ? '0.25rem' : '0.375rem',
                padding: isSmall ? '0.2rem 0.5rem' : '0.3rem 0.75rem',
                borderRadius: '6px',
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                textDecoration: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: isSmall ? '0.6875rem' : '0.8125rem',
                fontWeight: 500,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
            }}
        >
            <span style={{ fontSize: isSmall ? '0.75rem' : '0.875rem' }}>
                {cat?.emoji || '🧩'}
            </span>
            <span>{cat?.label || category}</span>
        </Link>
    )
}
