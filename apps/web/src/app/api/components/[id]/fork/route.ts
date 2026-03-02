export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@openui/database'
import { requireAuth } from '@/lib/api-utils'

// POST /api/components/[id]/fork — Fork a component
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { session, error: authError } = await requireAuth()
        if (authError) return authError
        const userId = session!.user!.id

        const original = await prisma.component.findUnique({
            where: { id },
        })

        if (!original) {
            return Response.json({ error: 'Not found' }, { status: 404 })
        }

        const fork = await prisma.component.create({
            data: {
                title: `Fork of ${original.title}`,
                description: original.description,
                category: original.category,
                tags: original.tags,
                codeJsx: original.codeJsx,
                codeHtml: original.codeHtml,
                codeCss: original.codeCss,
                codeJs: original.codeJs,
                authorId: userId,
                forkedFromId: original.id,
                voteScore: 0,
                currentVersion: 1,
            },
        })

        // Create initial version (v1) for the fork
        await prisma.componentVersion.create({
            data: {
                version: 1,
                componentId: fork.id,
                codeJsx: fork.codeJsx,
                codeHtml: fork.codeHtml,
                codeCss: fork.codeCss,
                codeJs: fork.codeJs,
                changeNote: 'Initial version (forked)',
            },
        })

        return Response.json({ id: fork.id }, { status: 201 })
    } catch (error) {
        console.error('[POST /api/components/[id]/fork]', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
