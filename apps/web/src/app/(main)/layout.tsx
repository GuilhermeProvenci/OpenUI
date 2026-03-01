import { Navbar } from '@/components/Navbar'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                {children}
            </main>
            <footer
                style={{
                    borderTop: '1px solid var(--color-border)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: 'var(--color-text-tertiary)',
                    fontSize: '0.8125rem',
                }}
            >
                <span className="gradient-text" style={{ fontWeight: 700 }}>
                    OpenUI
                </span>{' '}
                — An open platform for sharing UI components
            </footer>
        </div>
    )
}
