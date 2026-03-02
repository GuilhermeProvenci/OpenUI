import Link from 'next/link'
import { ChevronUp } from 'lucide-react'

interface RankedComponentCardProps {
    id: string
    rank: number
    title: string
    voteScore: number
    author?: {
        username?: string | null
        avatarUrl?: string | null
    } | null
}

const RANK_BACKGROUNDS: Record<number, string> = {
    1: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    2: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
    3: 'linear-gradient(135deg, #d97706, #b45309)',
}

export function RankedComponentCard({ id, rank, title, voteScore, author }: RankedComponentCardProps) {
    return (
        <Link
            href={`/component/${id}`}
            className="card-hover"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-card)',
                textDecoration: 'none',
            }}
        >
            <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '8px',
                fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0,
                background: RANK_BACKGROUNDS[rank] || 'var(--color-bg-tertiary)',
                color: rank <= 3 ? '#fff' : 'var(--color-text-secondary)',
            }}>
                {rank}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                    {author?.avatarUrl && <img src={author.avatarUrl} alt="" style={{ width: '14px', height: '14px', borderRadius: '50%' }} />}
                    <span>{author?.username}</span>
                </div>
            </div>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.25rem 0.625rem', borderRadius: '6px',
                fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0,
                background: voteScore > 0 ? 'rgba(249, 115, 22, 0.1)' : 'var(--color-bg-tertiary)',
                color: voteScore > 0 ? 'var(--color-upvote)' : 'var(--color-text-secondary)',
            }}>
                <ChevronUp size={14} />
                {voteScore}
            </div>
        </Link>
    )
}
