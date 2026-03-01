import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Category } from '@openui/database'

/** Merge Tailwind classes intelligently */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Format a date relative to now */
export function formatDate(date: Date | string): string {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 30) return `${days}d ago`

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
}

/** Download code as a file */
export function downloadCode(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

/** Map URL slug to Prisma Category enum */
export function categoryFromSlug(slug: string): Category {
    return slug.toUpperCase() as Category
}

/** Map Category enum to URL slug */
export function categoryToSlug(category: Category): string {
    return category.toLowerCase()
}

/** All categories for navigation */
export const CATEGORIES: { label: string; value: Category; emoji: string }[] = [
    { label: 'Button', value: 'BUTTON', emoji: '🔘' },
    { label: 'Card', value: 'CARD', emoji: '🃏' },
    { label: 'Input', value: 'INPUT', emoji: '✏️' },
    { label: 'Tabs', value: 'TABS', emoji: '📑' },
    { label: 'Modal', value: 'MODAL', emoji: '📦' },
    { label: 'Navbar', value: 'NAVBAR', emoji: '🧭' },
    { label: 'Chart', value: 'CHART', emoji: '📊' },
    { label: 'Badge', value: 'BADGE', emoji: '🏷️' },
    { label: 'Tooltip', value: 'TOOLTIP', emoji: '💬' },
    { label: 'Form', value: 'FORM', emoji: '📝' },
    { label: 'Table', value: 'TABLE', emoji: '📋' },
    { label: 'Hero', value: 'HERO', emoji: '🦸' },
    { label: 'Animation', value: 'ANIMATION', emoji: '✨' },
    { label: 'Other', value: 'OTHER', emoji: '🧩' },
]
