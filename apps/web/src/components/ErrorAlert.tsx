interface ErrorAlertProps {
    message: string
}

export function ErrorAlert({ message }: ErrorAlertProps) {
    if (!message) return null
    return (
        <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--color-error)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
        }}>
            {message}
        </div>
    )
}
