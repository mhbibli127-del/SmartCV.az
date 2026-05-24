export interface ExperienceItem {
  title: string;
  company: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  university: string;
}

export interface CVData {
  name: string;
  email: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
}

export interface JobDescription {
  title: string;
  description: string;
}

export interface JobMatchResult {
  matchScore: number;
  missingSkills: string[];
  suggestedJobs: string[];
}

export interface SkillGapResult {
  missingSkills: string[];
  roadmap: string[];
}

export interface InterviewQuestion {
  question: string;
  advice: string;
}

export interface InterviewResult {
  questions: InterviewQuestion[];
  improvedAnswers: string;
}

export interface PortfolioResult {
  websiteOutline: string;
  projectIdeas: string[];
}

export interface ApplySimulation {
  coverLetter: string;
  applicationSummary: string;
}
