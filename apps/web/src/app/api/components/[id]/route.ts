export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@openui/database'

// GET /api/components/[id] — Get single component with full details
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        const component = await prisma.component.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                        bio: true,
                    },
                },
                forkedFrom: {
                    include: {
                        author: { select: { username: true } },
                    },
                },
                forks: {
                    take: 10,
                    orderBy: { voteScore: 'desc' },
                    include: {
                        author: { select: { username: true, avatarUrl: true } },
                    },
                },
                suggestions: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: { select: { username: true, avatarUrl: true } },
                    },
                },
                _count: {
                    select: { votes: true, suggestions: true, forks: true },
                },
            },
        })

        if (!component) {
            return Response.json({ error: 'Not found' }, { status: 404 })
        }

        // Get user's vote if authenticated
        let userVote = null
        if (session?.user?.id) {
            const vote = await prisma.vote.findUnique({
                where: {
                    userId_componentId: {
                        userId: session.user.id,
                        componentId: id,
                    },
                },
            })
            userVote = vote?.value ?? null
        }

        return Response.json({ ...component, userVote })
    } catch (error) {
        console.error('[GET /api/components/[id]]', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT /api/components/[id] — Update component (author only)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const component = await prisma.component.findUnique({
            where: { id },
        })

        if (!component) {
            return Response.json({ error: 'Not found' }, { status: 404 })
        }
        if (component.authorId !== session.user.id) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = (await req.json()) as {
            title?: string
            description?: string
            category?: string
            tags?: string[]
            codeJsx?: string
            codeHtml?: string
            codeCss?: string
            codeJs?: string
        }

        const updated = await prisma.component.update({
            where: { id },
            data: {
                ...(body.title && { title: body.title }),
                ...(body.description !== undefined && {
                    description: body.description,
                }),
                ...(body.category && { category: body.category as any }),
                ...(body.tags && { tags: body.tags.map((t) => t.toLowerCase()) }),
                ...(body.codeJsx !== undefined && { codeJsx: body.codeJsx }),
                ...(body.codeHtml !== undefined && { codeHtml: body.codeHtml }),
                ...(body.codeCss !== undefined && { codeCss: body.codeCss }),
                ...(body.codeJs !== undefined && { codeJs: body.codeJs }),
            },
        })

        return Response.json(updated)
    } catch (error) {
        console.error('[PUT /api/components/[id]]', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/components/[id] — Delete component (author only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const component = await prisma.component.findUnique({
            where: { id },
        })

        if (!component) {
            return Response.json({ error: 'Not found' }, { status: 404 })
        }
        if (component.authorId !== session.user.id) {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }

        await prisma.component.delete({ where: { id } })

        return Response.json({ success: true })
    } catch (error) {
        console.error('[DELETE /api/components/[id]]', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
