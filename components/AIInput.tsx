"use client";
import { useState } from "react";

export default function AIInput({ setCV }: any) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);

    const res = await fetch("/api/cv/auto-build", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    const cv = typeof data.cv === "string" ? JSON.parse(data.cv) : data.cv;
    setCV(cv);

    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-xl">
      <textarea
        className="w-full h-40 p-3 text-black"
        placeholder="Tell me about yourself..."
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={generate}
        className="mt-4 bg-blue-500 px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate CV"}
      </button>
    </div>
  );
}
