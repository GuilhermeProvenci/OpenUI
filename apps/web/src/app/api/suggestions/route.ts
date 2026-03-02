export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@openui/database'
import { rateLimit } from '@/lib/redis'
import { requireAuth } from '@/lib/api-utils'

// POST /api/suggestions — Create a suggestion (PR-style)
export async function POST(req: NextRequest) {
    try {
        const { session, error: authError } = await requireAuth()
        if (authError) return authError
        const userId = session!.user!.id

        // Rate limit: 10 suggestions per day
        const limited = await rateLimit(`suggest:${userId}`, 10, 86400)
        if (limited) {
            return Response.json({ error: 'Rate limited' }, { status: 429 })
        }

        const body = (await req.json()) as {
            componentId: string
            title: string
            description: string
            codeJsx?: string
            codeHtml?: string
            codeCss?: string
            codeJs?: string
        }

        if (!body.title || !body.description || !body.componentId) {
            return Response.json(
                { error: 'Title, description, and componentId are required' },
                { status: 400 }
            )
        }

        // Verify the component exists
        const component = await prisma.component.findUnique({
            where: { id: body.componentId },
        })
        if (!component) {
            return Response.json({ error: 'Component not found' }, { status: 404 })
        }

        const suggestion = await prisma.suggestion.create({
            data: {
                title: body.title,
                description: body.description,
                codeJsx: body.codeJsx ?? null,
                codeHtml: body.codeHtml ?? null,
                codeCss: body.codeCss ?? null,
                codeJs: body.codeJs ?? null,
                authorId: userId,
                componentId: body.componentId,
            },
        })

        return Response.json({ id: suggestion.id }, { status: 201 })
    } catch (error) {
        console.error('[POST /api/suggestions]', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
