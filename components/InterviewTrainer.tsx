"use client";
import { useState } from "react";

export default function InterviewTrainer({ cv, setInterview }: any) {
  const [data, setData] = useState<any>(null);

  const generate = async () => {
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv }),
    });

    const result = await res.json();
    setData(result);
    setInterview(result);
  };

  return (
    <div className="bg-yellow-600 p-4 rounded-xl">
      <button onClick={generate}>Start Interview</button>

      {data && (
        <ul className="mt-3">
          {data.questions?.map((q: string, i: number) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
