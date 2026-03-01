'use client'

import { signIn } from 'next-auth/react'
import { Code2 } from 'lucide-react'

export default function LoginPage() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg-primary)',
                padding: '1rem',
            }}
        >
            {/* Background glow */}
            <div
                style={{
                    position: 'fixed',
                    top: '20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <div
                className="glass"
                style={{
                    maxWidth: '440px',
                    width: '100%',
                    padding: '3rem 2.5rem',
                    borderRadius: '20px',
                    textAlign: 'center',
                    position: 'relative',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem',
                    }}
                >
                    <Code2 size={40} style={{ color: 'var(--color-brand-light)' }} />
                    <span
                        className="gradient-text"
                        style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            letterSpacing: '-1px',
                        }}
                    >
                        OpenUI
                    </span>
                </div>

                <h1
                    style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        color: 'var(--color-text-primary)',
                    }}
                >
                    Welcome back
                </h1>
                <p
                    style={{
                        color: 'var(--color-text-secondary)',
                        marginBottom: '2rem',
                        fontSize: '0.9375rem',
                        lineHeight: 1.5,
                    }}
                >
                    Sign in to share your UI components, vote on others&apos; work, and
                    collaborate with the community.
                </p>

                {/* GitHub Sign In */}
                <button
                    onClick={() => signIn('github', { callbackUrl: '/' })}
                    className="transition-base"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        padding: '0.875rem 1.5rem',
                        borderRadius: '12px',
                        background: '#24292e',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#2d3238'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#24292e'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.transform = 'translateY(0)'
                    }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="currentColor"
                    >
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                    Continue with GitHub
                </button>

                <p
                    style={{
                        marginTop: '1.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.5,
                    }}
                >
                    By signing in, you agree to share your public GitHub profile
                    information with OpenUI.
                </p>
            </div>
        </div>
    )
}
