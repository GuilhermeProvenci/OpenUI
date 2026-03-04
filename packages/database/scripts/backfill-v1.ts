/**
 * Backfill script: Create v1 ComponentVersion for all existing components
 * that don't have one yet.
 *
 * Run with: npx tsx scripts/backfill-v1.ts
 */
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
    // Find components that don't have a version 1
    const componentsWithoutV1 = await prisma.component.findMany({
        where: {
            versions: {
                none: { version: 1 },
            },
        },
        select: {
            id: true,
            title: true,
            codeJsx: true,
            codeHtml: true,
            codeCss: true,
            codeJs: true,
            createdAt: true,
        },
    })

    console.log(`Found ${componentsWithoutV1.length} components without v1`)

    for (const comp of componentsWithoutV1) {
        await prisma.componentVersion.create({
            data: {
                version: 1,
                componentId: comp.id,
                codeJsx: comp.codeJsx,
                codeHtml: comp.codeHtml,
                codeCss: comp.codeCss,
                codeJs: comp.codeJs,
                changeNote: 'Initial version',
                createdAt: comp.createdAt, // preserve original timestamp
            },
        })
        console.log(`  Created v1 for "${comp.title}" (${comp.id})`)
    }

    console.log('Done!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
