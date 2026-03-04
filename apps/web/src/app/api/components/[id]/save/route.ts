import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@openui/database";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const component = await prisma.component.findUnique({
      where: { id },
    });

    if (!component) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const existing = await prisma.componentSave.findUnique({
      where: {
        userId_componentId: {
          userId: session.user.id,
          componentId: id,
        },
      },
    });

    if (existing) {
      await prisma.componentSave.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false });
    }

    await prisma.componentSave.create({
      data: {
        userId: session.user.id,
        componentId: id,
      },
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("[save]", error);
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
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ saved: false });
    }

    const existing = await prisma.componentSave.findUnique({
      where: {
        userId_componentId: {
          userId: session.user.id,
          componentId: id,
        },
      },
    });

    return NextResponse.json({ saved: !!existing });
  } catch (error) {
    console.error("[save GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
