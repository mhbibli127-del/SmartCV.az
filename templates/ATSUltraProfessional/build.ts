import { A4_WIDTH, el, resetZIndex, SAMPLE, type TemplateFonts, type TemplateTheme } from "@/templates/shared";

/** ATS ultra clean — plain text, zero graphics, max readability */
export function buildATSUltraProfessional(theme: TemplateTheme, fonts: TemplateFonts) {
  resetZIndex();
  const pad = 72;
  const w = A4_WIDTH - pad * 2;
  let y = 64;

  const sections: Array<{ label: string; body: string; h: number }> = [
    { label: "OBJECTIVE", body: SAMPLE.summary, h: 48 },
    { label: "WORK EXPERIENCE", body: SAMPLE.experience, h: 140 },
    { label: "EDUCATION", body: SAMPLE.education, h: 64 },
    { label: "SKILLS", body: SAMPLE.skills.replace(/\n/g, ", "), h: 32 },
    { label: "LANGUAGES", body: SAMPLE.languages.replace(/\n/g, ", "), h: 24 },
  ];

  const elements = [
    el({
      id: "name",
      type: "text",
      x: pad,
      y,
      width: w,
      height: 28,
      content: SAMPLE.name,
      style: {
        fontSize: 22,
        fontWeight: 700,
        color: "#000000",
        fontFamily: fonts.body,
      },
    }),
    el({
      id: "contact",
      type: "text",
      x: pad,
      y: (y += 32),
      width: w,
      height: 16,
      content: SAMPLE.contact.replace(/•/g, "|"),
      style: { fontSize: 10, color: "#333333", fontFamily: fonts.body },
    }),
    el({
      id: "title",
      type: "text",
      x: pad,
      y: (y += 24),
      width: w,
      height: 18,
      content: SAMPLE.title,
      style: { fontSize: 11, fontWeight: 700, color: "#000000", fontFamily: fonts.body },
    }),
  ];

  y += 36;

  for (const section of sections) {
    elements.push(
      el({
        id: `label-${section.label}`,
        type: "text",
        x: pad,
        y,
        width: w,
        height: 14,
        content: section.label,
        style: {
          fontSize: 10,
          fontWeight: 700,
          color: "#000000",
          fontFamily: fonts.body,
          letterSpacing: 0.5,
        },
      }),
      el({
        id: `body-${section.label}`,
        type: "text",
        x: pad,
        y: (y += 18),
        width: w,
        height: section.h,
        content: section.body,
        sectionType: section.label.toLowerCase().replace(/\s+/g, "-"),
        style: {
          fontSize: 10,
          color: "#222222",
          fontFamily: fonts.body,
          lineHeight: 1.5,
        },
      })
    );
    y += section.h + 20;
  }

  return elements;
}
