import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/safe-route";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth-options";
import { DatabaseOperations } from "@/lib/models";
import {
  CV_SAMPLE_TOTAL,
  queryCVSamples,
  type CVSample,
} from "@/lib/cv-samples-catalog";

export const dynamic = "force-dynamic";

function toApiTemplate(sample: CVSample) {
  return {
    id: sample.id,
    slug: sample.slug,
    title: sample.title,
    category: sample.category,
    style: sample.style,
    color: sample.color,
    colors: sample.colors,
    description: sample.description,
    tag: sample.tag,
    features: sample.features,
    imageUrl: sample.imageUrl,
    views: sample.views,
    downloads: sample.downloads,
    rating: sample.rating,
    atsReady: sample.atsReady,
  };
}

// GET /api/templates — paginated CV sample catalog (1000+ built-in samples)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      48,
      Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10) || 24)
    );

    // Prefer Mongo when available; fall back to the built-in 1000+ catalog.
    try {
      let templates;
      if (search) {
        templates = await DatabaseOperations.searchTemplates(search);
      } else if (category && category !== "All") {
        templates = await DatabaseOperations.getTemplatesByCategory(category);
      } else {
        templates = await DatabaseOperations.getTemplates();
      }

      if (Array.isArray(templates) && templates.length >= 100) {
        const clean = templates.map(({ _id, ...rest }) => rest);
        return NextResponse.json({
          templates: clean,
          total: clean.length,
          page: 1,
          limit: clean.length,
          totalPages: 1,
          source: "mongo",
        });
      }
    } catch (dbError) {
      console.warn("Database unavailable, using built-in CV catalog:", dbError);
    }

    const result = queryCVSamples({ category, search, page, limit });
    return NextResponse.json({
      templates: result.templates.map(toApiTemplate),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      catalogTotal: CV_SAMPLE_TOTAL,
      source: "catalog",
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    const result = queryCVSamples({ page: 1, limit: 24 });
    return NextResponse.json({
      templates: result.templates.map(toApiTemplate),
      total: result.total,
      page: 1,
      limit: 24,
      totalPages: result.totalPages,
      catalogTotal: CV_SAMPLE_TOTAL,
      source: "catalog",
    });
  }
}

// POST /api/templates — Track template view, download, or selection
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJsonBody(req);
    const templateId = body.templateId;
    const action = typeof body.action === "string" ? body.action : "";
    const elementType = typeof body.elementType === "string" ? body.elementType : undefined;
    const page = typeof body.page === "string" ? body.page : undefined;
    const metadata =
      body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
        ? (body.metadata as Record<string, unknown>)
        : undefined;

    if (templateId == null || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      await DatabaseOperations.trackInteraction({
        userId: session.user.email,
        userEmail: session.user.email,
        action,
        elementType: elementType || "template",
        elementId: String(templateId),
        page: page || "/dashboard/examples",
        metadata,
      });

      if (action === "view" || action === "download") {
        await DatabaseOperations.updateTemplateStats(Number(templateId), action);
      }

      const template = await DatabaseOperations.getTemplateById(Number(templateId));
      const cleanTemplate = template ? { ...template, _id: undefined } : null;
      return NextResponse.json({ success: true, stats: cleanTemplate });
    } catch {
      // Tracking is optional when Mongo is down.
      return NextResponse.json({ success: true, stats: null });
    }
  } catch (error) {
    console.error("Error tracking template action:", error);
    return NextResponse.json({ error: "Failed to track action" }, { status: 500 });
  }
}
