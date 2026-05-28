import type { CvEditorTemplate } from "@/types/cv-editor";
import type { ResumeSampleData } from "@/templates/shared";
import {
  buildTemplateElements,
  getTemplateCanvasBackground,
  isKnownTemplateSlug,
  type TemplateSlug,
} from "@/templates/registry";
import {
  DISTINCT_TEMPLATES,
  defToEditorTemplate,
  getDistinctTemplate,
} from "@/lib/cv-editor/template-definitions";
import { SAMPLE } from "@/templates/shared";
import { mergeResumeDataIntoElements } from "@/lib/cv-editor/resume-data";

export function getEditorTemplate(slugOrId: string | null): CvEditorTemplate | null {
  if (!slugOrId) return null;
  const def = getDistinctTemplate(slugOrId);
  if (!def) return null;
  return defToEditorTemplate(def);
}

export const EDITOR_TEMPLATES: CvEditorTemplate[] = DISTINCT_TEMPLATES.map(defToEditorTemplate);

export function buildElementsFromTemplate(
  template: CvEditorTemplate,
  resumeData?: Partial<ResumeSampleData>
) {
  const slug = isKnownTemplateSlug(template.slug)
    ? (template.slug as TemplateSlug)
    : "minimal-corporate";

  const elements = buildTemplateElements(slug, template.colors, template.fonts);
  const data = resumeData && Object.keys(resumeData).length ? resumeData : SAMPLE;
  return mergeResumeDataIntoElements(elements, data);
}


export function canvasBackground(template: CvEditorTemplate): string {

  const slug = isKnownTemplateSlug(template.slug)

    ? (template.slug as TemplateSlug)

    : "minimal-corporate";

  return getTemplateCanvasBackground(slug, template.colors);

}



export { A4_WIDTH, A4_HEIGHT } from "@/lib/layout-engine";


