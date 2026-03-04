import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@openui/database";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ items: [], nextCursor: null });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = 20;

    const saves = await prisma.componentSave.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      include: {
        component: {
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
            _count: { select: { votes: true, suggestions: true, forks: true } },
          },
        },
      },
    });

    const hasMore = saves.length > limit;
    const items = hasMore ? saves.slice(0, limit) : saves;
    const nextCursor = hasMore
      ? items[items.length - 1].createdAt.toISOString()
      : null;

    const componentIds = items.map((s) => s.component.id);
    const userVotes: Record<string, number> = {};
    if (componentIds.length > 0) {
      const votes = await prisma.vote.findMany({
        where: {
          userId: session.user.id,
          componentId: { in: componentIds },
        },
        select: { componentId: true, value: true },
      });
      votes.forEach((v) => {
        userVotes[v.componentId] = v.value;
      });
    }

    return NextResponse.json({
      items: items.map((s) => ({
        ...s.component,
        userVote: userVotes[s.component.id] || null,
      })),
      nextCursor,
      userVotes,
    });
  } catch (error) {
    console.error("[saved]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
