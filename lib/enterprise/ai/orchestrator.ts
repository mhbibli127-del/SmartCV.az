import { getOpenAI } from "@/lib/openai";
import { buildTonePrompt } from "@/lib/enterprise/ai/tone-styles";
import { getResearchEngine } from "@/lib/enterprise/research/research-engine";
import { generatorDataToSections } from "@/lib/cv-hydration";
import { rateLimitAI } from "@/lib/enterprise/rate-limit/limiter";
import type {
  AIGenerateRequest,
  AIGenerateResult,
  ParsedSource,
  SourceType,
  ToneStyle,
} from "@/types/enterprise";

const CV_OUTPUT_SCHEMA = `{
  "fullName": "string",
  "title": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "string (3-4 sentences)",
  "experience": [{ "title": "string", "company": "string", "startDate": "string", "endDate": "string", "description": ["bullet strings with metrics"] }],
  "education": [{ "degree": "string", "university": "string", "graduationYear": "string" }],
  "skills": ["string array"],
  "atsScore": number (0-100 estimate)
}`;

function buildSystemPrompt(toneStyle: ToneStyle, researchContext?: string): string {
  return [
    "You are an expert CV/resume writer and ATS optimization specialist.",
    "Output ONLY valid JSON matching the schema provided. No markdown fences.",
    buildTonePrompt(toneStyle),
    "Rules:",
    "- Every experience bullet must include a quantifiable metric where plausible.",
    "- Optimize for ATS parsing: standard section names, no tables, no graphics references.",
    "- Use strong action verbs. Avoid clichés like 'team player' without evidence.",
    researchContext ? `\nMarket research context:\n${researchContext}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function parseSource(
  sourceType: SourceType,
  input: unknown
): Promise<ParsedSource> {
  const research = getResearchEngine();

  switch (sourceType) {
    case "prompt":
      return {
        type: "prompt",
        rawText: String(input),
        structured: { prompt: String(input) },
      };

    case "github": {
      const username = String(input).replace(/^https:\/\/github\.com\//, "").split("/")[0];
      const profile = await research.fetchGitHubProfile(username);
      return {
        type: "github",
        rawText: JSON.stringify(profile, null, 2),
        structured: profile ?? { username },
        metadata: { username },
      };
    }

    case "job-description":
      return {
        type: "job-description",
        rawText: String(input),
        structured: { jobDescription: String(input) },
      };

    case "pdf":
    case "linkedin":
    case "portfolio":
      return {
        type: sourceType,
        rawText: typeof input === "string" ? input : JSON.stringify(input),
        structured: typeof input === "object" ? (input as Record<string, unknown>) : undefined,
      };

    default:
      return { type: "prompt", rawText: String(input) };
  }
}

function extractResearchContext(research: Awaited<ReturnType<ReturnType<typeof getResearchEngine>["search"]>>): string {
  const parts: string[] = [];
  if (research.skills?.length) parts.push(`Trending skills: ${research.skills.join(", ")}`);
  if (research.snippets.length) {
    parts.push(
      "Research snippets:",
      ...research.snippets.slice(0, 3).map((s) => `- ${s.title}: ${s.content.slice(0, 150)}`)
    );
  }
  return parts.join("\n");
}

/**
 * Main AI orchestrator — coordinates source parsing, research, and generation.
 */
export async function generateCV(request: AIGenerateRequest): Promise<AIGenerateResult> {
  const rateLimit = await rateLimitAI(request.userId);
  if (!rateLimit.allowed) {
    return {
      generationId: "",
      status: "failed",
      error: `Rate limit exceeded. Try again after ${rateLimit.resetAt.toISOString()}`,
    };
  }

  const generationId = `gen_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const parsed = await parseSource(request.sourceType, request.input);

  let researchContext = "";
  if (request.sourceType === "job-description" || request.jobDescription) {
    const jd = request.jobDescription ?? parsed.rawText;
    const research = await getResearchEngine().researchJobDescription(jd);
    researchContext = extractResearchContext(research);
  } else if (parsed.structured?.title || parsed.rawText.length > 20) {
    const roleMatch = parsed.rawText.match(/(?:as a|for a|role:?)\s*([^.,\n]{5,40})/i);
    const role = roleMatch?.[1] ?? parsed.rawText.slice(0, 40);
    const research = await getResearchEngine().researchForRole(role);
    researchContext = extractResearchContext(research);
  }

  const userPrompt = [
    `Generate a complete CV/resume as JSON.`,
    `Schema: ${CV_OUTPUT_SCHEMA}`,
    `Language: ${request.language ?? "en"}`,
    `\nSource data (${request.sourceType}):\n${parsed.rawText.slice(0, 12000)}`,
    request.jobDescription
      ? `\nTarget job description:\n${request.jobDescription.slice(0, 4000)}`
      : "",
  ].join("\n");

  try {
    const client = getOpenAI();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(request.toneStyle, researchContext) },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const generated = JSON.parse(raw) as Record<string, unknown>;
    const sections = generatorDataToSections(generated);

    return {
      generationId,
      status: "completed",
      content: generated,
      sections,
      atsScore: typeof generated.atsScore === "number" ? generated.atsScore : undefined,
    };
  } catch (err) {
    return {
      generationId,
      status: "failed",
      error: err instanceof Error ? err.message : "Generation failed",
    };
  }
}

export async function enhanceContent(
  cvContent: Record<string, unknown>,
  toneStyle: ToneStyle = "modern-tech"
): Promise<Record<string, unknown>> {
  const client = getOpenAI();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(toneStyle) },
      {
        role: "user",
        content: `Enhance this CV content. Return improved JSON with same structure.\n${JSON.stringify(cvContent).slice(0, 10000)}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 4096,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as Record<string, unknown>;
}
