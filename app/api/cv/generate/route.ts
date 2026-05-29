import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/session";
import { getOpenAI } from "@/lib/openai";
import { assertCanUseAI, incrementAiUsed } from "@/lib/ai-limit";
import { handleApiError, unauthorized } from "@/lib/api-errors";
import { parseJsonBody } from "@/lib/safe-route";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await parseJsonBody(req);
    const fullName = String(body.fullName ?? "");
    const email = String(body.email ?? "");
    const phone = String(body.phone ?? "");
    const location = String(body.location ?? "");
    const website = String(body.website ?? "");
    const title = String(body.title ?? "");
    const rawExperience = String(body.rawExperience ?? "");
    const rawEducation = String(body.rawEducation ?? "");
    const rawSkills = String(body.rawSkills ?? "");
    const targetIndustry = String(body.targetIndustry ?? "");

    const user = await getAuthenticatedUser(req);

    if (!user?.email) {
      return unauthorized();
    }

    const aiCheck = await assertCanUseAI(user.email);
    if (!aiCheck.allowed) {
      return NextResponse.json(
        { error: aiCheck.error, code: aiCheck.code },
        { status: 403 }
      );
    }

    const prompt = `You are an expert CV writer and career coach. Create a stunning, professional CV for the following person:

Personal Information:
- Name: ${fullName}
- Email: ${email || "Not provided"}
- Phone: ${phone || "Not provided"}
- Location: ${location || "Not provided"}
- Website: ${website || "Not provided"}
- Current Title: ${title}
- Target Industry: ${targetIndustry || "General"}

Raw Experience: ${rawExperience || "No experience provided"}

Raw Education: ${rawEducation || "No education provided"}

Raw Skills: ${rawSkills || "No skills provided"}

Generate a complete, beautifully formatted CV with the following sections in JSON format:
{
  "summary": "A compelling 2-3 sentence professional summary that highlights their unique value proposition",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "startDate": "Start date (e.g., Jan 2020)",
      "endDate": "End date or Present",
      "description": "3-4 bullet points of key achievements and responsibilities, using action verbs and quantifiable results"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "university": "University name",
      "graduationYear": "Graduation year",
      "gpa": "GPA if applicable"
    }
  ],
  "skills": ["List of 8-12 relevant skills, categorized by type if possible"],
  "achievements": ["3-4 major career achievements or awards"]
}

Make the CV content impressive, ATS-optimized, and tailored to the ${targetIndustry || "general"} industry. Use professional language and focus on results and impact.`;

    const openai = getOpenAI();
    if (!openai) {
      return NextResponse.json(
        { error: "AI service is not configured", code: "AI_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional CV writer. Return only valid JSON without markdown formatting.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content generated", code: "AI_EMPTY" },
        { status: 500 }
      );
    }

    let cvData;
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
      cvData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", code: "AI_PARSE_ERROR" },
        { status: 500 }
      );
    }

    await incrementAiUsed(user.email);

    return NextResponse.json({
      success: true,
      cvData,
      usage: {
        aiUsed: (aiCheck.aiUsed ?? 0) + 1,
        remaining: aiCheck.remaining,
      },
    });
  } catch (err) {
    return handleApiError(err, "cv/generate POST", "Failed to generate CV");
  }
}
