import type { CvEditorElement } from "@/types/cv-editor";
import { SAMPLE, type ResumeSampleData } from "@/templates/shared";

export type { ResumeSampleData };

const FIELD_IDS: Array<keyof ResumeSampleData> = [
  "name",
  "title",
  "contact",
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
];

export function extractResumeData(elements: CvEditorElement[]): Partial<ResumeSampleData> {
  const data: Partial<ResumeSampleData> = {};

  for (const element of elements) {
    if (element.type === "image") continue;
    const id = element.id as keyof ResumeSampleData;
    if (FIELD_IDS.includes(id) && element.content.trim()) {
      data[id] = element.content;
    }
  }

  return data;
}

export function mergeResumeDataIntoElements(
  elements: CvEditorElement[],
  data: Partial<ResumeSampleData>
): CvEditorElement[] {
  if (!Object.keys(data).length) return elements;

  return elements.map((element) => {
    const id = element.id as keyof ResumeSampleData;
    const next = data[id];
    if (!next || element.type === "image") return element;
    return { ...element, content: next };
  });
}

export function hasUserEditedContent(elements: CvEditorElement[]): boolean {
  const data = extractResumeData(elements);
  return FIELD_IDS.some((field) => {
    const value = data[field]?.trim();
    const sample = SAMPLE[field]?.trim();
    return Boolean(value && value !== sample);
  });
}
