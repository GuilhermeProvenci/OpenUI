export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@openui/database'
import { requireAuth } from '@/lib/api-utils'

// POST /api/suggestions/[id]/reject — Reject a suggestion (component author only)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { session, error: authError } = await requireAuth()
        if (authError) return authError

        const suggestion = await prisma.suggestion.findUnique({
            where: { id },
            include: { component: true },
        })

        if (!suggestion) {
            return Response.json({ error: 'Not found' }, { status: 404 })
        }
        if (suggestion.component.authorId !== session!.user!.id) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }
        if (suggestion.status !== 'PENDING') {
            return Response.json({ error: 'Already resolved' }, { status: 409 })
        }

        await prisma.suggestion.update({
            where: { id },
            data: { status: 'REJECTED' },
        })

        return Response.json({ success: true })
    } catch (error) {
        console.error('[POST /api/suggestions/[id]/reject]', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
