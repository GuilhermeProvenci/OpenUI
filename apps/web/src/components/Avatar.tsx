interface AvatarProps {
    src?: string | null
    alt?: string
    size?: number
    fallback?: string
}

export function Avatar({ src, alt = '', size = 32, fallback }: AvatarProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    flexShrink: 0,
                    border: size >= 64 ? '3px solid var(--color-border)' : '2px solid var(--color-border)',
                }}
            />
        )
    }

    const letter = fallback?.[0]?.toUpperCase() || alt?.[0]?.toUpperCase() || '?'
    const fontSize = size >= 64 ? '2rem' : size >= 32 ? '0.875rem' : '0.75rem'

    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-brand), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize,
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
        }}>
            {letter}
        </div>
    )
}
