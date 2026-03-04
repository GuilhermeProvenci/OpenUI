import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const p = new PrismaClient({ adapter })

async function main() {
    const versions = await p.componentVersion.findMany({
        orderBy: [{ componentId: 'asc' }, { version: 'asc' }],
        select: { componentId: true, version: true, changeNote: true },
    })
    console.log(JSON.stringify(versions, null, 2))
    console.log(`Total: ${versions.length} versions`)
}

main().finally(() => p.$disconnect())
