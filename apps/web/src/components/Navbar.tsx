'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Code2,
    Plus,
    Search,
    LogOut,
    Menu,
    X,
    ChevronDown,
} from 'lucide-react'
import { CATEGORIES } from '@openui/ui'
import { Avatar } from '@/components/Avatar'

export function Navbar() {
    const { data: session } = useSession()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [categoriesOpen, setCategoriesOpen] = useState(false)

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
        }
    }

    return (
        <nav className="glass" style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: '1px solid var(--color-border)',
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '0 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '64px',
                gap: '1rem',
            }}>
                {/* Logo */}
                <Link
                    href="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none',
                        flexShrink: 0,
                    }}
                >
                    <Code2
                        size={28}
                        style={{ color: 'var(--color-brand-light)' }}
                    />
                    <span
                        className="gradient-text"
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 800,
                            letterSpacing: '-0.5px',
                        }}
                    >
                        OpenUI
                    </span>
                </Link>

                {/* Categories Dropdown */}
                <div style={{ position: 'relative' }} className="hide-mobile">
                    <button
                        onClick={() => setCategoriesOpen(!categoriesOpen)}
                        className="transition-base"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.color = 'var(--color-text-primary)')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.color = 'var(--color-text-secondary)')
                        }
                    >
                        Categories
                        <ChevronDown
                            size={16}
                            style={{
                                transform: categoriesOpen ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s',
                            }}
                        />
                    </button>
                    {categoriesOpen && (
                        <>
                            <div
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    zIndex: 40,
                                }}
                                onClick={() => setCategoriesOpen(false)}
                            />
                            <div
                                className="glass"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    marginTop: '0.25rem',
                                    padding: '0.5rem',
                                    borderRadius: '12px',
                                    minWidth: '220px',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '0.25rem',
                                    zIndex: 50,
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                }}
                            >
                                {CATEGORIES.map((cat) => (
                                    <Link
                                        key={cat.value}
                                        href={`/${cat.value.toLowerCase()}`}
                                        onClick={() => setCategoriesOpen(false)}
                                        className="transition-base"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            color: 'var(--color-text-secondary)',
                                            fontSize: '0.8125rem',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--color-bg-tertiary)'
                                            e.currentTarget.style.color = 'var(--color-text-primary)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent'
                                            e.currentTarget.style.color = 'var(--color-text-secondary)'
                                        }}
                                    >
                                        <span>{cat.emoji}</span>
                                        <span>{cat.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Search Bar */}
                <form
                    onSubmit={handleSearch}
                    className="hide-mobile"
                    style={{
                        flex: 1,
                        maxWidth: '400px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: '10px',
                            border: '1px solid var(--color-border)',
                            padding: '0 0.75rem',
                            transition: 'border-color 0.2s',
                        }}
                    >
                        <Search size={16} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search components..."
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                padding: '0.5rem',
                                color: 'var(--color-text-primary)',
                                fontSize: '0.875rem',
                            }}
                        />
                    </div>
                </form>

                {/* Right Actions */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexShrink: 0,
                }}>
                    {session ? (
                        <>
                            <Link
                                href="/component/new"
                                className="transition-base"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.5)'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(99, 102, 241, 0.3)'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }}
                            >
                                <Plus size={16} />
                                <span className="hide-mobile-text">Post</span>
                            </Link>

                            <Link
                                href={`/profile/${(session.user as any)?.username || session.user?.name || 'me'}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textDecoration: 'none',
                                }}
                            >
                                <Avatar
                                    src={session.user?.image}
                                    alt="Avatar"
                                    size={32}
                                    fallback={session.user?.name || '?'}
                                />
                            </Link>

                            <button
                                onClick={() => signOut()}
                                className="transition-base"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-text-tertiary)',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = 'var(--color-error)')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.color = 'var(--color-text-tertiary)')
                                }
                                title="Sign out"
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="transition-base"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1.25rem',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.5)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            Sign In
                        </Link>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        className="show-mobile"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            display: 'none',
                            padding: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                        }}
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile dropdown */}
            {mobileMenuOpen && (
                <div
                    className="show-mobile-menu"
                    style={{
                        display: 'none',
                        padding: '1rem',
                        borderTop: '1px solid var(--color-border)',
                    }}
                >
                    <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: '10px',
                                border: '1px solid var(--color-border)',
                                padding: '0 0.75rem',
                            }}
                        >
                            <Search size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search components..."
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    padding: '0.625rem 0.5rem',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.875rem',
                                }}
                            />
                        </div>
                    </form>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.25rem',
                        }}
                    >
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.value}
                                href={`/${cat.value.toLowerCase()}`}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.8125rem',
                                }}
                            >
                                <span>{cat.emoji}</span>
                                <span>{cat.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .hide-mobile-text { display: none !important; }
          .show-mobile { display: flex !important; }
          .show-mobile-menu { display: block !important; }
        }
      `}</style>
        </nav>
    )
}
