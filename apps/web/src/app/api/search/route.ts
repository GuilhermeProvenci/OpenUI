export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@openui/database";

// GET /api/search?q=... — Search users and components
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 1) {
      return Response.json({ components: [], users: [] });
    }

    const [components, users] = await Promise.all([
      prisma.component.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { tags: { hasSome: [q.toLowerCase()] } },
          ],
        },
        orderBy: { voteScore: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          category: true,
          author: { select: { username: true, avatarUrl: true } },
        },
      }),
      prisma.user.findMany({
        where: {
          username: { contains: q, mode: "insensitive" },
        },
        take: 5,
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
          _count: { select: { components: true } },
        },
      }),
    ]);

    return Response.json({ components, users });
  } catch (error) {
    console.error("[GET /api/search]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
