export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@openui/database'
import { rateLimit } from '@/lib/redis'

// POST /api/components/[id]/vote — Vote on a component
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

        // Rate limit: 50 votes per hour per user
        const limited = await rateLimit(`vote:${session.user.id}`, 50, 3600)
        if (limited) {
            return Response.json({ error: 'Rate limited' }, { status: 429 })
        }

        const { value } = (await req.json()) as { value: 1 | -1 }
        if (value !== 1 && value !== -1) {
            return Response.json({ error: 'Invalid value' }, { status: 400 })
        }

        const existing = await prisma.vote.findUnique({
            where: {
                userId_componentId: {
                    userId: session.user.id,
                    componentId: id,
                },
            },
        })

        if (existing?.value === value) {
            // Toggle off — remove vote
            await prisma.$transaction([
                prisma.vote.delete({ where: { id: existing.id } }),
                prisma.component.update({
                    where: { id },
                    data: { voteScore: { decrement: value } },
                }),
            ])
            const updated = await prisma.component.findUnique({
                where: { id },
                select: { voteScore: true },
            })
            return Response.json({ voteScore: updated!.voteScore, userVote: null })
        }

        // Switching vote counts double
        const scoreDelta = existing ? value * 2 : value

        await prisma.$transaction([
            prisma.vote.upsert({
                where: {
                    userId_componentId: {
                        userId: session.user.id,
                        componentId: id,
                    },
                },
                create: { value, userId: session.user.id, componentId: id },
                update: { value },
            }),
            prisma.component.update({
                where: { id },
                data: { voteScore: { increment: scoreDelta } },
            }),
        ])

        const updated = await prisma.component.findUnique({
            where: { id },
            select: { voteScore: true },
        })
        return Response.json({ voteScore: updated!.voteScore, userVote: value })
    } catch (error) {
        console.error('[POST /api/components/[id]/vote]', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
