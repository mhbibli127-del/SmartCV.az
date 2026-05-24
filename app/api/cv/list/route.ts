import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { findUserByEmail } from "@/lib/users";
import { DatabaseOperations } from "@/lib/models";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = auth.email.toLowerCase().trim();
    const cvs: {
      id: string;
      title: string;
      status: string;
      updatedAt: string;
      source: "mongo" | "prisma";
    }[] = [];

    try {
      const mongoCvs = await DatabaseOperations.getUserCVs(email);
      for (const cv of mongoCvs) {
        cvs.push({
          id: cv._id?.toString() ?? crypto.randomUUID(),
          title:
            cv.data?.generatorData?.title ||
            cv.data?.templateName ||
            "Untitled CV",
          status: cv.status ?? "draft",
          updatedAt: cv.updatedAt?.toISOString?.() ?? new Date().toISOString(),
          source: "mongo",
        });
      }
    } catch {
      /* MongoDB optional */
    }

    const user = await findUserByEmail(email);
    if (user && "id" in user) {
      const prismaCvs = await prisma.cV.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 20,
      });
      for (const cv of prismaCvs) {
        cvs.push({
          id: String(cv.id),
          title: cv.title || "Untitled CV",
          status: cv.status || "draft",
          updatedAt: cv.updatedAt.toISOString(),
          source: "prisma",
        });
      }
    }

    cvs.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({ cvs, total: cvs.length });
  } catch (err) {
    console.error("[cv/list]", err);
    return NextResponse.json({ error: "Failed to load CVs" }, { status: 500 });
  }
}
