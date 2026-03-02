import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
    const versions = await p.componentVersion.findMany({
        orderBy: [{ componentId: 'asc' }, { version: 'asc' }],
        select: { componentId: true, version: true, changeNote: true },
    })
    console.log(JSON.stringify(versions, null, 2))
    console.log(`Total: ${versions.length} versions`)
}

main().finally(() => p.$disconnect())
