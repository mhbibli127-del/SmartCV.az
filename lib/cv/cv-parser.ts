export function parseCvText(text: string) {
  if (!text) return { name: "Unknown", email: "", phone: "", sections: [], raw: "" };

  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  
  // Heuristic for name: Usually the first non-contact line that isn't too long
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/;
  
  let name = "Unknown";
  let summary = "";
  const sections: string[] = [];

  for (const line of lines) {
    if (!emailRegex.test(line) && !phoneRegex.test(line) && line.length > 2 && line.length < 50 && name === "Unknown") {
      name = line;
    } else if (line.length > 60 && !summary) {
      summary = line;
    } else {
      sections.push(line);
    }
  }

  // Advanced heuristic for better "Working AI" simulation without LLM
  const languages = lines.filter(l => /lang|dil/i.test(l) && l.length < 30);
  const projects = lines.filter(l => /proj|iş/i.test(l) && l.length < 40 && l.length > 5);

  return {
    name,
    email: lines.find((l) => emailRegex.test(l)) || "",
    phone: lines.find((l) => phoneRegex.test(l)) || "",
    sections,
    raw: text,
    summary,
    languages,
    projects,
    certifications: [],
    awards: [],
  };
}
