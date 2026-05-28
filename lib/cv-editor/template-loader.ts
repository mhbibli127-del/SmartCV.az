import type { CvEditorTemplate } from "@/types/cv-editor";

import { buildElementsFromTemplate, canvasBackground } from "@/lib/cv-editor/template-catalog";



/** Re-export for store — delegates to distinct template builders */

export { buildElementsFromTemplate, canvasBackground };

export { A4_WIDTH, A4_HEIGHT } from "@/lib/layout-engine";



export function loadTemplateIntoEditor(template: CvEditorTemplate) {

  return {

    elements: buildElementsFromTemplate(template),

    background: canvasBackground(template),

  };

}


