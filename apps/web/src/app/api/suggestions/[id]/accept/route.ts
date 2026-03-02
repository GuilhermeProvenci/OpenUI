export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@openui/database'
import { requireAuth } from '@/lib/api-utils'

// POST /api/suggestions/[id]/accept — Accept a suggestion (component author only)
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

        const newVersion = suggestion.component.currentVersion + 1

        // Compute the merged code (suggestion fields override component fields)
        const mergedCode = {
            codeJsx: suggestion.codeJsx !== null ? suggestion.codeJsx : suggestion.component.codeJsx,
            codeHtml: suggestion.codeHtml !== null ? suggestion.codeHtml : suggestion.component.codeHtml,
            codeCss: suggestion.codeCss !== null ? suggestion.codeCss : suggestion.component.codeCss,
            codeJs: suggestion.codeJs !== null ? suggestion.codeJs : suggestion.component.codeJs,
        }

        await prisma.$transaction([
            prisma.component.update({
                where: { id: suggestion.componentId },
                data: {
                    ...mergedCode,
                    currentVersion: newVersion,
                },
            }),
            prisma.suggestion.update({
                where: { id },
                data: { status: 'ACCEPTED' },
            }),
            prisma.componentVersion.create({
                data: {
                    version: newVersion,
                    componentId: suggestion.componentId,
                    codeJsx: mergedCode.codeJsx,
                    codeHtml: mergedCode.codeHtml,
                    codeCss: mergedCode.codeCss,
                    codeJs: mergedCode.codeJs,
                    changeNote: suggestion.title,
                    suggestionId: suggestion.id,
                },
            }),
        ])

        return Response.json({ success: true })
    } catch (error) {
        console.error('[POST /api/suggestions/[id]/accept]', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
