import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@openui/database";
import { rateLimit } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const component = await prisma.component.findUnique({
      where: { id },
    });

    if (!component) {
      return NextResponse.json(
        { error: "Component not found" },
        { status: 404 },
      );
    }

    const isAuthenticated = !!userId;

    if (isAuthenticated) {
      try {
        const limited = await rateLimit(`view:${userId}`, 100, 3600);
        if (limited) {
          return NextResponse.json({ error: "Rate limited" }, { status: 429 });
        }
      } catch (rateLimitError) {
        console.error("[view] rateLimit error:", rateLimitError);
      }

      const existingView = await prisma.componentView.findFirst({
        where: {
          componentId: id,
          userId,
        },
      });

      if (!existingView) {
        await prisma.$transaction([
          prisma.componentView.create({
            data: {
              componentId: id,
              userId,
            },
          }),
          prisma.component.update({
            where: { id },
            data: {
              viewCount: { increment: 1 },
              uniqueViewCount: { increment: 1 },
            },
          }),
        ]);

        return NextResponse.json({
          viewCount: component.viewCount + 1,
          uniqueViewCount: component.uniqueViewCount + 1,
          isUnique: true,
        });
      }

      await prisma.component.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      return NextResponse.json({
        viewCount: component.viewCount + 1,
        uniqueViewCount: component.uniqueViewCount,
        isUnique: false,
      });
    }

    await prisma.component.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      viewCount: component.viewCount + 1,
      uniqueViewCount: component.uniqueViewCount,
      isUnique: false,
    });
  } catch (error) {
    console.error("[view]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const component = await prisma.component.findUnique({
      where: { id },
      select: {
        viewCount: true,
        uniqueViewCount: true,
      },
    });

    if (!component) {
      return NextResponse.json(
        { error: "Component not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(component);
  } catch (error) {
    console.error("[view GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
