export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@openui/database'

// GET /api/components/[id]/versions/[version] — Get code for a specific version
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; version: string }> }
) {
    try {
        const { id, version: versionStr } = await params
        const versionNum = parseInt(versionStr, 10)

        if (isNaN(versionNum) || versionNum < 1) {
            return Response.json({ error: 'Invalid version' }, { status: 400 })
        }

        const componentVersion = await prisma.componentVersion.findUnique({
            where: {
                componentId_version: {
                    componentId: id,
                    version: versionNum,
                },
            },
            select: {
                id: true,
                version: true,
                codeJsx: true,
                codeHtml: true,
                codeCss: true,
                codeJs: true,
                changeNote: true,
                createdAt: true,
            },
        })

        if (!componentVersion) {
            return Response.json({ error: 'Version not found' }, { status: 404 })
        }

        return Response.json(componentVersion)
    } catch (error) {
        console.error('[GET /api/components/[id]/versions/[version]]', error)
        return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
}
