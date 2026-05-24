const fs = require("fs");
const path = require("path");

function createFile(filePath, content) {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, content);
  console.log("Created:", filePath);
}

// ================= FILES =================

// openai
createFile("lib/openai.ts", `
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
`);

// types
createFile("types/cv.ts", `
export interface CVData {
  name: string;
  email: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    description: string;
  }[];
  education: {
    degree: string;
    university: string;
  }[];
}
`);

// parse API
createFile("app/api/cv/parse/route.ts", `
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Extract structured CV data in JSON" },
      { role: "user", content: text },
    ],
  });

  return NextResponse.json({
    data: completion.choices[0].message.content,
  });
}
`);

// analyze API
createFile("app/api/cv/analyze/route.ts", `
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const { cv } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: \`
Return JSON:
{
  ats: number,
  readability: number,
  impact: number,
  keyword_match: number,
  improvements: string[]
}
\`,
      },
      {
        role: "user",
        content: JSON.stringify(cv),
      },
    ],
  });

  return NextResponse.json({
    result: completion.choices[0].message.content,
  });
}
`);

// generate API
createFile("app/api/cv/generate/route.ts", `
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const { data } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Generate ATS-friendly CV",
      },
      {
        role: "user",
        content: JSON.stringify(data),
      },
    ],
  });

  return NextResponse.json({
    cv: completion.choices[0].message.content,
  });
}
`);

// score
createFile("lib/cv-score.ts", `
export function calculateLocalScore(cv: any) {
  let score = 0;

  if (cv.skills?.length > 5) score += 25;
  if (cv.experience?.length > 1) score += 25;
  if (cv.education?.length > 0) score += 25;
  if (cv.name && cv.email) score += 25;

  return score;
}
`);

// AI Panel
createFile("components/AIAnalysisPanel.tsx", `
"use client";
import { useState } from "react";

export default function AIAnalysisPanel({ cv }: any) {
  const [analysis, setAnalysis] = useState<any>(null);

  const analyze = async () => {
    const res = await fetch("/api/cv/analyze", {
      method: "POST",
      body: JSON.stringify({ cv }),
    });

    const data = await res.json();
    setAnalysis(JSON.parse(data.result));
  };

  return (
    <div className="p-4 bg-black text-white rounded-xl">
      <button onClick={analyze}>Analyze CV</button>

      {analysis && (
        <div>
          <p>ATS: {analysis.ats}</p>
          <p>Impact: {analysis.impact}</p>
          <p>Readability: {analysis.readability}</p>
        </div>
      )}
    </div>
  );
}
`);

// editor
createFile("components/CVEditor.tsx", `
"use client";
import { useState } from "react";

export default function CVEditor() {
  const [text, setText] = useState("");

  const improve = async () => {
    const res = await fetch("/api/cv/generate", {
      method: "POST",
      body: JSON.stringify({ data: text }),
    });

    const data = await res.json();
    setText(data.cv);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={improve}>Improve</button>
    </div>
  );
}
`);

// dashboard
createFile("app/dashboard/page.tsx", `
import AIAnalysisPanel from "@/components/AIAnalysisPanel";
import CVEditor from "@/components/CVEditor";

export default function Dashboard() {
  const dummyCV = {
    name: "Murad",
    skills: ["React", "Next.js"],
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <CVEditor />
      <AIAnalysisPanel cv={dummyCV} />
    </div>
  );
}
`);

console.log("DONE 🚀");