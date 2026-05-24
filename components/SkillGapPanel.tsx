"use client";
import { useState } from "react";

export default function SkillGapPanel({ cv, setSkillGap }: any) {
  const [data, setData] = useState<any>(null);

  const analyze = async () => {
    const res = await fetch("/api/skill/gap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv, targetJob: "Frontend Developer" }),
    });

    const result = await res.json();
    setData(result);
    setSkillGap(result);
  };

  return (
    <div className="bg-green-600 p-4 rounded-xl">
      <button onClick={analyze}>Analyze Skill Gap</button>

      {data && (
        <div className="mt-3">
          <p>Missing: {data.missingSkills?.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
