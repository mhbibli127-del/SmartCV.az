import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { generatePDF } from "@/lib/pdfGenerator";

export const dynamic = "force-dynamic";

/** POST /api/cv/export — pixel-accurate PDF export via jsPDF */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const cvData = body.cvData ?? body.cv ?? body;
    const color = body.color ?? body.accentColor ?? "#0f172a";

    if (!cvData?.personal?.fullName && !cvData?.fullName) {
      return NextResponse.json(
        { message: "Add your name before exporting.", fallback: true },
        { status: 200 }
      );
    }

    const normalized = {
      fullName: cvData.personal?.fullName ?? cvData.fullName ?? "My CV",
      title: cvData.personal?.title ?? cvData.title ?? "",
      email: cvData.personal?.email ?? cvData.email,
      phone: cvData.personal?.phone ?? cvData.phone,
      location: cvData.personal?.location ?? cvData.location,
      website: cvData.personal?.website ?? cvData.website,
      summary: cvData.summary,
      experience: cvData.experience,
      education: cvData.education,
      skills: cvData.skills,
      achievements: cvData.achievements,
      personal: cvData.personal,
    };

    const { pdfBase64, fileName } = generatePDF(normalized, color);
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("[cv/export]", err);
    return NextResponse.json(
      { message: "Export failed — try again in a moment.", fallback: true },
      { status: 200 }
    );
  }
}
