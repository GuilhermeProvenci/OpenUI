export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@openui/database'

// POST /api/suggestions/[id]/accept — Accept a suggestion (component author only)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const suggestion = await prisma.suggestion.findUnique({
            where: { id },
            include: { component: true },
        })

        if (!suggestion) {
            return Response.json({ error: 'Not found' }, { status: 404 })
        }
        if (suggestion.component.authorId !== session.user.id) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }
        if (suggestion.status !== 'PENDING') {
            return Response.json({ error: 'Already resolved' }, { status: 409 })
        }

        await prisma.$transaction([
            prisma.component.update({
                where: { id: suggestion.componentId },
                data: {
                    // Only overwrite fields that were actually suggested (non-null)
                    ...(suggestion.codeJsx !== null && { codeJsx: suggestion.codeJsx }),
                    ...(suggestion.codeHtml !== null && {
                        codeHtml: suggestion.codeHtml,
                    }),
                    ...(suggestion.codeCss !== null && { codeCss: suggestion.codeCss }),
                    ...(suggestion.codeJs !== null && { codeJs: suggestion.codeJs }),
                },
            }),
            prisma.suggestion.update({
                where: { id },
                data: { status: 'ACCEPTED' },
            }),
        ])

        return Response.json({ success: true })
    } catch (error) {
        console.error('[POST /api/suggestions/[id]/accept]', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
