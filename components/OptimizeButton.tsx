"use client";

export default function OptimizeButton({ cv, setCV }: any) {
  const optimize = async () => {
    const res = await fetch("/api/cv/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cv, jobDescription: "Senior product manager for a fast-growing SaaS company focused on analytics, cross-functional teamwork, and customer impact." }),
    });

    const data = await res.json();
    setCV(data);
  };

  return (
    <button className="bg-blue-600 px-4 py-2 rounded" onClick={optimize}>
      Improve CV with AI
    </button>
  );
}
