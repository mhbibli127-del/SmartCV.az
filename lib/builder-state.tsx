"use client";

// Global state management for CV Builder using React Context
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CVSection {
  id: string;
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'languages';
  title: string;
  content: any;
  order: number;
}

export interface CVData {
  id?: string;
  userId?: string;
  templateId?: number;
  templateName?: string;
  sections: CVSection[];
  metadata: {
    createdAt?: Date;
    updatedAt?: Date;
    version: number;
  };
}

interface BuilderContextType {
  cvData: CVData;
  selectedTemplate: number | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  
  // Actions
  setCvData: (data: CVData) => void;
  updateSection: (sectionId: string, content: any) => void;
  addSection: (section: CVSection) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (sections: CVSection[]) => void;
  setTemplate: (templateId: number, templateName: string) => void;
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
  resetBuilder: () => void;
}

const initialState: CVData = {
  sections: [
    {
      id: 'personal',
      type: 'personal',
      title: 'Personal Information',
      content: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        website: ''
      },
      order: 0
    },
    {
      id: 'summary',
      type: 'summary',
      title: 'Professional Summary',
      content: '',
      order: 1
    },
    {
      id: 'experience',
      type: 'experience',
      title: 'Work Experience',
      content: [],
      order: 2
    },
    {
      id: 'education',
      type: 'education',
      title: 'Education',
      content: [],
      order: 3
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      content: [],
      order: 4
    }
  ],
  metadata: {
    version: 1
  }
};

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [cvData, setCvDataState] = useState<CVData>(initialState);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSavedState] = useState<Date | null>(null);

  const setCvData = useCallback((data: CVData) => {
    setCvDataState(data);
    setIsDirty(true);
  }, []);

  const updateSection = useCallback((sectionId: string, content: any) => {
    setCvDataState((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, content } : section
      ),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }));
    setIsDirty(true);
  }, []);

  const addSection = useCallback((section: CVSection) => {
    setCvDataState((prev) => ({
      ...prev,
      sections: [...prev.sections, section],
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }));
    setIsDirty(true);
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setCvDataState((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }));
    setIsDirty(true);
  }, []);

  const reorderSections = useCallback((sections: CVSection[]) => {
    setCvDataState((prev) => ({
      ...prev,
      sections: sections.map((section, index) => ({ ...section, order: index })),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }));
    setIsDirty(true);
  }, []);

  const setTemplate = useCallback((templateId: number, templateName: string) => {
    setSelectedTemplate(templateId);
    setCvDataState((prev) => ({
      ...prev,
      templateId,
      templateName,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }));
    setIsDirty(true);
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    setIsSaving(saving);
  }, []);

  const setLastSaved = useCallback((date: Date | null) => {
    setLastSavedState(date);
  }, []);

  const resetBuilder = useCallback(() => {
    setCvDataState(initialState);
    setSelectedTemplate(null);
    setIsDirty(false);
    setIsSaving(false);
    setLastSavedState(null);
  }, []);

  const value: BuilderContextType = {
    cvData,
    selectedTemplate,
    isDirty,
    isSaving,
    lastSaved,
    setCvData,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
    setTemplate,
    setDirty,
    setSaving,
    setLastSaved,
    resetBuilder
  };

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (context === undefined) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}
