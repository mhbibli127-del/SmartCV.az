"use client";
import { useState } from "react";

export default function JobMatchPanel({ cv, setJobMatch }: any) {
  const [data, setData] = useState<any>(null);

  const analyze = async () => {
    const res = await fetch("/api/job/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv }),
    });

    const result = await res.json();
    setData(result);
    setJobMatch(result);
  };

  return (
    <div className="bg-purple-600 p-4 rounded-xl">
      <button onClick={analyze}>Check Job Match</button>

      {data && (
        <div className="mt-3">
          <p>Match: {data.matchScore}%</p>
          <p>Missing: {data.missingSkills?.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
