import Link from 'next/link'
import { ChevronUp, Crown, Medal, Award } from 'lucide-react'
import { FireCanvas } from '@/components/FireCanvas'
import { PreviewButton } from '@/components/PreviewButton'

interface RankedComponentCardProps {
    id: string
    rank: number
    title: string
    voteScore: number
    category?: string
    featured?: boolean
    codeJsx?: string | null
    codeHtml?: string | null
    codeCss?: string | null
    codeJs?: string | null
    author?: {
        username?: string | null
        avatarUrl?: string | null
    } | null
}

const RANK_STYLES: Record<number, { bg: string; border: string; glow: string }> = {
    1: {
        bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.04))',
        border: 'rgba(251, 191, 36, 0.3)',
        glow: '0 0 20px rgba(251, 191, 36, 0.1)',
    },
    2: {
        bg: 'linear-gradient(135deg, rgba(209, 213, 219, 0.06), rgba(156, 163, 175, 0.03))',
        border: 'rgba(156, 163, 175, 0.25)',
        glow: '0 0 15px rgba(156, 163, 175, 0.08)',
    },
    3: {
        bg: 'linear-gradient(135deg, rgba(217, 119, 6, 0.06), rgba(180, 83, 9, 0.03))',
        border: 'rgba(217, 119, 6, 0.25)',
        glow: '0 0 15px rgba(217, 119, 6, 0.08)',
    },
}

const RANK_BADGE_BG: Record<number, string> = {
    1: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    2: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
    3: 'linear-gradient(135deg, #d97706, #b45309)',
}

const RANK_ICONS: Record<number, typeof Crown> = {
    1: Crown,
    2: Medal,
    3: Award,
}

export function RankedComponentCard({ id, rank, title, voteScore, category, featured, codeJsx, codeHtml, codeCss, codeJs, author }: RankedComponentCardProps) {
    const isTop3 = rank <= 3
    const style = RANK_STYLES[rank]
    const RankIcon = RANK_ICONS[rank]

    if (featured) {
        return (
            <Link
                href={`/component/${id}`}
                className="card-hover"
                style={{
                    display: 'block',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 120, 20, 0.25)',
                    background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 60%, #0f0f1a 100%)',
                    boxShadow: '0 0 40px rgba(255, 80, 0, 0.12), 0 20px 60px rgba(0,0,0,0.4)',
                    textDecoration: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '0.625rem',
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1.25rem 1.5rem',
                    position: 'relative',
                    zIndex: 2,
                }}>
                    {/* Gold rank badge */}
                    <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        color: '#fff', flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                    }}>
                        <Crown size={22} />
                    </span>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '1.05rem', fontWeight: 700,
                            color: '#fff',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            marginBottom: '0.3rem',
                            textShadow: '0 0 20px rgba(255, 100, 0, 0.3)',
                        }}>
                            {title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                {author?.avatarUrl && (
                                    <img src={author.avatarUrl} alt="" style={{
                                        width: '18px', height: '18px', borderRadius: '50%',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                    }} />
                                )}
                                {author?.username}
                            </span>
                            {category && (
                                <>
                                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                                    <span style={{ textTransform: 'capitalize' }}>{category.toLowerCase()}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Preview + Score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <PreviewButton
                            title={title}
                            href={`/component/${id}`}
                            codeJsx={codeJsx}
                            codeHtml={codeHtml}
                            codeCss={codeCss}
                            codeJs={codeJs}
                            size={15}
                            light
                        />
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: '0.0625rem',
                            padding: '0.5rem 1rem', borderRadius: '10px',
                            fontSize: '1rem', fontWeight: 700,
                            background: 'rgba(255, 106, 0, 0.15)',
                            color: '#ff6a00',
                            border: '1px solid rgba(255, 106, 0, 0.25)',
                        }}>
                            <ChevronUp size={15} style={{ marginBottom: '-2px' }} />
                            {voteScore}
                        </div>
                    </div>
                </div>

                {/* Fire strip */}
                <FireCanvas height={55} />
            </Link>
        )
    }

    return (
        <Link
            href={`/component/${id}`}
            className="card-hover"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '1rem 1.125rem',
                borderRadius: '14px',
                border: `1px solid ${isTop3 ? style?.border ?? 'var(--color-border)' : 'var(--color-border)'}`,
                background: isTop3 && style ? style.bg : 'var(--color-bg-card)',
                boxShadow: isTop3 && style ? style.glow : 'none',
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Rank badge */}
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.125rem',
                flexShrink: 0,
            }}>
                <span style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '36px', height: '36px', borderRadius: '10px',
                    fontSize: isTop3 ? '0.875rem' : '0.8125rem', fontWeight: 800, flexShrink: 0,
                    background: RANK_BADGE_BG[rank] || 'var(--color-bg-tertiary)',
                    color: isTop3 ? '#fff' : 'var(--color-text-secondary)',
                    boxShadow: isTop3 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                }}>
                    {isTop3 && RankIcon ? <RankIcon size={18} /> : `#${rank}`}
                </span>
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.9rem', fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: '0.25rem',
                }}>
                    {title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {author?.avatarUrl && (
                            <img src={author.avatarUrl} alt="" style={{
                                width: '16px', height: '16px', borderRadius: '50%',
                                border: '1px solid var(--color-border)',
                            }} />
                        )}
                        {author?.username}
                    </span>
                    {category && (
                        <>
                            <span style={{ color: 'var(--color-border-light)' }}>·</span>
                            <span style={{ textTransform: 'capitalize' }}>{category.toLowerCase()}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Preview + Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                <PreviewButton
                    title={title}
                    href={`/component/${id}`}
                    codeJsx={codeJsx}
                    codeHtml={codeHtml}
                    codeCss={codeCss}
                    codeJs={codeJs}
                />
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '0.0625rem',
                    padding: '0.375rem 0.75rem', borderRadius: '8px',
                    fontSize: '0.9rem', fontWeight: 700,
                    background: voteScore > 0 ? 'rgba(249, 115, 22, 0.1)' : 'var(--color-bg-tertiary)',
                    color: voteScore > 0 ? 'var(--color-upvote)' : 'var(--color-text-secondary)',
                    border: voteScore > 0 ? '1px solid rgba(249, 115, 22, 0.15)' : '1px solid transparent',
                }}>
                    <ChevronUp size={14} style={{ marginBottom: '-2px' }} />
                    {voteScore}
                </div>
            </div>
        </Link>
    )
}
