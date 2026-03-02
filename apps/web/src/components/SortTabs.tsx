'use client'

import { Flame, Clock, TrendingUp } from 'lucide-react'
import type { SortOption } from '@/types'

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'hot', label: 'Hot', icon: <Flame size={15} /> },
    { value: 'new', label: 'New', icon: <Clock size={15} /> },
    { value: 'top', label: 'Top', icon: <TrendingUp size={15} /> },
]

interface SortTabsProps {
    value: SortOption
    onChange: (value: SortOption) => void
}

export function SortTabs({ value, onChange }: SortTabsProps) {
    return (
        <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.25rem',
            borderRadius: '12px',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            width: 'fit-content',
        }}>
            {SORT_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className="transition-base"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: value === option.value ? 'var(--color-bg-elevated)' : 'transparent',
                        color: value === option.value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                        fontSize: '0.8125rem',
                        fontWeight: value === option.value ? 600 : 400,
                        cursor: 'pointer',
                        boxShadow: value === option.value ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    }}
                >
                    {option.icon}
                    {option.label}
                </button>
            ))}
        </div>
    )
}
