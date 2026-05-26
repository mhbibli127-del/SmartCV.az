import type { DesignTheme, TemplateMetadata } from "@/types/design-system";
import type { CVContent } from "@/types/cv-document";
import { getThemeById } from "@/lib/design-engine/themes";
import { getTemplateBySlug } from "@/lib/design-engine/template-catalog";

export interface DesignPersistState {
  themeId: string;
  theme: DesignTheme;
  templateSlug?: string;
  templateId?: string;
}

export function designSnapshot(
  theme: DesignTheme,
  template: TemplateMetadata | null
): DesignPersistState {
  return {
    themeId: theme.id,
    theme,
    templateSlug: template?.slug,
    templateId: template?.id,
  };
}

export function restoreDesignFromContent(content: CVContent): DesignPersistState | null {
  const raw = content.designTheme as DesignPersistState | undefined;
  if (raw?.theme) return raw;

  if (raw?.themeId) {
    const theme = getThemeById(raw.themeId);
    if (theme) {
      const template = raw.templateSlug ? getTemplateBySlug(raw.templateSlug) : undefined;
      return {
        themeId: theme.id,
        theme,
        templateSlug: raw.templateSlug,
        templateId: template?.id ?? raw.templateId,
      };
    }
  }

  return null;
}
