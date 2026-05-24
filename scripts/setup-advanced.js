const fs = require("fs");
const path = require("path");

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log("Created:", filePath);
}

// ================= LIVE SCORE =================
createFile("components/LiveScore.tsx", `
"use client";
import { useEffect, useState } from "react";

export default function LiveScore({ cv }: any) {
  const [score, setScore] = useState<any>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const res = await fetch("/api/cv/analyze", {
        method: "POST",
        body: JSON.stringify({ cv }),
      });

      const data = await res.json();
      setScore(JSON.parse(data.result));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [cv]);

  return (
    <div className="p-4 bg-zinc-900 text-white rounded-xl">
      <h2>Live Score</h2>
      {score && (
        <>
          <p>ATS: {score.ats}</p>
          <p>Impact: {score.impact}</p>
          <p>Readability: {score.readability}</p>
        </>
      )}
    </div>
  );
}
`);

// ================= ADMIN =================
createFile("app/admin/page.tsx", `
export default function AdminPage() {
  const users = 120;
  const cvs = 340;
  const revenue = 1200;

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="bg-zinc-800 p-4 rounded">Users: {users}</div>
        <div className="bg-zinc-800 p-4 rounded">CVs: {cvs}</div>
        <div className="bg-zinc-800 p-4 rounded">Revenue: $\${revenue}</div>
      </div>
    </div>
  );
}
`);

// ================= AUTH =================
createFile("app/api/auth/[...nextauth]/route.ts", `
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
`);

createFile("components/LoginButton.tsx", `
"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return <button onClick={() => signOut()}>Logout</button>;
  }

  return <button onClick={() => signIn("google")}>Login with Google</button>;
}
`);

createFile("app/layout.tsx", `
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: any) {
  return (
    <html>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
`);

// ================= DASHBOARD =================
createFile("app/dashboard/page.tsx", `
import CVEditor from "@/components/CVEditor";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";
import LiveScore from "@/components/LiveScore";

export default function Dashboard() {
  const dummyCV = {
    name: "Murad",
    skills: ["React", "Next.js"],
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <CVEditor />
      <AIAnalysisPanel cv={dummyCV} />
      <LiveScore cv={dummyCV} />
    </div>
  );
}
`);

console.log("🔥 ALL ADVANCED FEATURES CREATED");