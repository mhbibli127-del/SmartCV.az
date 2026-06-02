"use client";

import { useCallback, useState } from "react";
import type { AuthField, AuthValidationIssue } from "@/lib/auth-validation";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function useAuthFieldErrors() {
  const { t } = useLanguage();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<AuthField, string>>>({});

  const messageFor = useCallback(
    (issue: AuthValidationIssue) => {
      const key = `auth.${issue.code}`;
      const translated = t(key);
      return translated !== key ? translated : issue.code;
    },
    [t]
  );

  const applyIssues = useCallback(
    (issues: AuthValidationIssue[]) => {
      const next: Partial<Record<AuthField, string>> = {};
      for (const issue of issues) {
        if (!next[issue.field]) next[issue.field] = messageFor(issue);
      }
      setFieldErrors(next);
      return issues.length === 0;
    },
    [messageFor]
  );

  const clearField = useCallback((field: AuthField) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setFieldErrors({}), []);

  return { fieldErrors, applyIssues, clearField, clearAll, messageFor };
}
