'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface Props {
    componentId: string
    initialScore: number
    initialUserVote: 1 | -1 | null
}

export function VoteButton({ componentId, initialScore, initialUserVote }: Props) {
    const [score, setScore] = useState(initialScore)
    const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote)
    const [animating, setAnimating] = useState<'up' | 'down' | null>(null)

    async function vote(value: 1 | -1) {
        const prevScore = score
        const prevVote = userVote

        // Optimistic update
        if (userVote === value) {
            setScore((s) => s - value)
            setUserVote(null)
        } else {
            setScore((s) => s + (userVote ? value * 2 : value))
            setUserVote(value)
        }

        // Trigger animation
        setAnimating(value === 1 ? 'up' : 'down')
        setTimeout(() => setAnimating(null), 300)

        try {
            await fetch(`/api/components/${componentId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            })
        } catch {
            // Revert on error
            setScore(prevScore)
            setUserVote(prevVote)
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
            }}
        >
            <button
                onClick={() => vote(1)}
                className={`transition-base ${animating === 'up' ? 'vote-pulse' : ''}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '28px',
                    borderRadius: '6px',
                    border: 'none',
                    background: userVote === 1 ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                    color: userVote === 1 ? 'var(--color-upvote)' : 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                    padding: 0,
                }}
                title="Upvote"
            >
                <ChevronUp size={20} strokeWidth={userVote === 1 ? 3 : 2} />
            </button>

            <span
                style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color:
                        userVote === 1
                            ? 'var(--color-upvote)'
                            : userVote === -1
                                ? 'var(--color-downvote)'
                                : 'var(--color-text-primary)',
                    minWidth: '20px',
                    textAlign: 'center',
                    lineHeight: 1,
                }}
            >
                {score}
            </span>

            <button
                onClick={() => vote(-1)}
                className={`transition-base ${animating === 'down' ? 'vote-pulse' : ''}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '28px',
                    borderRadius: '6px',
                    border: 'none',
                    background: userVote === -1 ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    color: userVote === -1 ? 'var(--color-downvote)' : 'var(--color-text-tertiary)',
                    cursor: 'pointer',
                    padding: 0,
                }}
                title="Downvote"
            >
                <ChevronDown size={20} strokeWidth={userVote === -1 ? 3 : 2} />
            </button>
        </div>
    )
}
