export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@openui/database";
import { rateLimit } from "@/lib/redis";
import { Category, Prisma } from "@openui/database";

// GET /api/components — List components with pagination, sorting, and filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as Category | null;
    const sort = (searchParams.get("sort") ?? "hot") as "hot" | "new" | "top";
    const cursor = searchParams.get("cursor");
    const search = searchParams.get("q");
    const authorUsername = searchParams.get("author");
    const includeArchived = searchParams.get("includeArchived") === "true";
    const period = searchParams.get("period"); // 'week' | 'month' | null
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const limit = Math.min(Math.max(limitParam, 1), 50);

    const session = await getServerSession(authOptions);

    // Resolve author username to user ID if filtering by author
    let authorFilter: Prisma.ComponentWhereInput = {};
    let profileUser: any = null;
    if (authorUsername) {
      profileUser = await prisma.user.findUnique({
        where: { username: authorUsername },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
          components: {
            select: {
              viewCount: true,
              uniqueViewCount: true,
            },
          },
        },
      });
      if (!profileUser) {
        return Response.json({
          items: [],
          nextCursor: null,
          userVotes: {},
          profileUser: null,
        });
      }
      const totalViews = profileUser.components.reduce(
        (sum: number, c: any) => sum + (c.viewCount || 0),
        0,
      );
      const uniqueViews = profileUser.components.reduce(
        (sum: number, c: any) => sum + (c.uniqueViewCount || 0),
        0,
      );
      profileUser = {
        id: profileUser.id,
        username: profileUser.username,
        avatarUrl: profileUser.avatarUrl,
        bio: profileUser.bio,
        createdAt: profileUser.createdAt,
        totalViews,
        uniqueViews,
      };
      authorFilter = { authorId: profileUser.id };
    }

    // Only the profile owner can see their own archived (unpublished) components
    const isOwnProfile = profileUser && session?.user?.id === profileUser.id;
    let publishedFilter: Prisma.ComponentWhereInput;
    if (includeArchived && isOwnProfile) {
      publishedFilter = {}; // show all (published + archived)
    } else {
      publishedFilter = { published: true };
    }

    const orderBy = {
      hot: [{ voteScore: "desc" as const }, { createdAt: "desc" as const }],
      new: [{ createdAt: "desc" as const }],
      top: [{ voteScore: "desc" as const }],
    }[sort] as Prisma.ComponentOrderByWithRelationInput[];

    // Period filter (e.g., "week" for top 10 this week)
    let periodFilter: Prisma.ComponentWhereInput = {};
    if (period === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      periodFilter = { createdAt: { gte: oneWeekAgo } };
    } else if (period === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      periodFilter = { createdAt: { gte: oneMonthAgo } };
    }

    // Merge cursor filter with period filter on createdAt
    let createdAtFilter: Prisma.ComponentWhereInput = {};
    if (cursor && period) {
      // Both cursor and period: createdAt must satisfy both gte and lt
      createdAtFilter = {
        createdAt: {
          ...(periodFilter.createdAt as object),
          lt: new Date(cursor),
        },
      };
    } else if (cursor) {
      createdAtFilter = { createdAt: { lt: new Date(cursor) } };
    } else if (period) {
      createdAtFilter = periodFilter;
    }

    const where: Prisma.ComponentWhereInput = {
      ...publishedFilter,
      ...authorFilter,
      ...(category ? { category } : {}),
      ...createdAtFilter,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { tags: { hasSome: [search.toLowerCase()] } },
            ],
          }
        : {}),
    };

    const components = await prisma.component.findMany({
      where,
      orderBy,
      take: limit + 1,
      include: {
        author: { select: { username: true, avatarUrl: true } },
        _count: { select: { votes: true, suggestions: true, forks: true } },
      },
    });

    const hasMore = components.length > limit;
    const items = hasMore ? components.slice(0, limit) : components;
    const nextCursor = hasMore
      ? items[items.length - 1].createdAt.toISOString()
      : null;

    // Batch fetch user votes for all returned components
    let userVotes: Record<string, number> = {};
    if (session?.user?.id) {
      const componentIds = items.map((c) => c.id);
      const votes = await prisma.vote.findMany({
        where: {
          userId: session.user.id,
          componentId: { in: componentIds },
        },
        select: { componentId: true, value: true },
      });
      userVotes = Object.fromEntries(
        votes.map((v) => [v.componentId, v.value]),
      );
    }

    return Response.json({
      items,
      nextCursor,
      userVotes,
      ...(profileUser ? { profileUser } : {}),
    });
  } catch (error) {
    console.error("[GET /api/components]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/components — Create a new component
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 5 components per day per user
    const limited = await rateLimit(`post:${session.user.id}`, 5, 86400);
    if (limited) {
      return Response.json(
        { error: "Rate limited. Max 5 components per day." },
        { status: 429 },
      );
    }

    const body = (await req.json()) as {
      title: string;
      description?: string;
      category: Category;
      tags?: string[];
      codeJsx?: string;
      codeHtml?: string;
      codeCss?: string;
      codeJs?: string;
    };

    // Validation
    if (!body.title || body.title.length < 3 || body.title.length > 80) {
      return Response.json(
        { error: "Title must be 3–80 characters" },
        { status: 400 },
      );
    }
    if (
      !body.category ||
      !Object.values(Category).includes(body.category as Category)
    ) {
      return Response.json({ error: "Invalid category" }, { status: 400 });
    }
    if (!body.codeJsx && !body.codeHtml) {
      return Response.json(
        { error: "At least one of JSX or HTML code is required" },
        { status: 400 },
      );
    }
    if (body.tags && body.tags.length > 5) {
      return Response.json({ error: "Max 5 tags allowed" }, { status: 400 });
    }
    if (body.tags?.some((t) => t.length > 20)) {
      return Response.json(
        { error: "Each tag must be max 20 characters" },
        { status: 400 },
      );
    }

    const component = await prisma.component.create({
      data: {
        title: body.title,
        description: body.description || null,
        category: body.category,
        tags: body.tags?.map((t) => t.toLowerCase()) || [],
        codeJsx: body.codeJsx || null,
        codeHtml: body.codeHtml || null,
        codeCss: body.codeCss || null,
        codeJs: body.codeJs || null,
        authorId: session.user.id,
        currentVersion: 1,
      },
    });

    // Create initial version (v1)
    await prisma.componentVersion.create({
      data: {
        version: 1,
        componentId: component.id,
        codeJsx: component.codeJsx,
        codeHtml: component.codeHtml,
        codeCss: component.codeCss,
        codeJs: component.codeJs,
        changeNote: "Initial version",
      },
    });

    return Response.json({ id: component.id }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/components]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
