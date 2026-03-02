import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@openui/database'

/**
 * Requires an authenticated session. Returns session or sends 401.
 */
export async function requireAuth() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { session: null, error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    return { session, error: null }
}

/**
 * Requires the current user to be the author of a component.
 * Returns the component or sends 404/403.
 */
export async function requireAuthor(componentId: string, userId: string) {
    const component = await prisma.component.findUnique({
        where: { id: componentId },
    })
    if (!component) {
        return { component: null, error: Response.json({ error: 'Not found' }, { status: 404 }) }
    }
    if (component.authorId !== userId) {
        return { component: null, error: Response.json({ error: 'Forbidden' }, { status: 403 }) }
    }
    return { component, error: null }
}
