export function ComponentGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={`skeleton-${i}`}
                    style={{
                        background: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                    }}
                >
                    <div className="skeleton" style={{ height: '180px', borderRadius: 0 }} />
                    <div style={{ padding: '1rem' }}>
                        <div className="skeleton" style={{ height: '16px', width: '70%', marginBottom: '0.5rem' }} />
                        <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: '0.75rem' }} />
                        <div className="skeleton" style={{ height: '20px', width: '50px' }} />
                    </div>
                </div>
            ))}
        </>
    )
}
