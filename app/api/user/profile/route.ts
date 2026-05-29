import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/safe-route";
import { getAuthenticatedUser } from "@/lib/session";
import { DatabaseOperations } from "@/lib/models";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let bio = "";
    let avatar: string | null = null;
    try {
      const db = await import("@/lib/mongodb").then((m) => m.getDatabase());
      const profile = await db.collection("profiles").findOne({ userId: user.email });
      bio = (profile as { bio?: string } | null)?.bio ?? "";
      avatar = (profile as { avatar?: string } | null)?.avatar ?? null;
    } catch {
      /* optional */
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      bio,
      avatar,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJsonBody(req);
    const name = typeof body.name === "string" ? body.name : undefined;
    const email = typeof body.email === "string" ? body.email : undefined;
    const phone = typeof body.phone === "string" ? body.phone : undefined;
    const bio = typeof body.bio === "string" ? body.bio : undefined;
    const avatar = typeof body.avatar === "string" ? body.avatar : undefined;
    const cleanEmail = user.email.toLowerCase().trim();

    if (name) {
      try {
        await prisma.user.update({
          where: { email: cleanEmail },
          data: { name: String(name).slice(0, 120) },
        });
      } catch {
        /* Prisma optional */
      }
    }

    try {
      await DatabaseOperations.upsertUserProfile({
        userId: cleanEmail,
        userEmail: cleanEmail,
        name: name || user.name || undefined,
        bio: typeof bio === "string" ? bio.slice(0, 500) : undefined,
        avatar: typeof avatar === "string" ? avatar.slice(0, 2048) : undefined,
        preferences: {
          theme: "light",
          language: "en",
          notifications: true,
          phone: typeof phone === "string" ? phone : undefined,
        },
        stats: {
          cvsCreated: 0,
          templatesUsed: 0,
          lastActive: new Date(),
        },
      });
    } catch {
      /* Mongo optional */
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: { name, email: email || user.email, phone, bio, avatar },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
