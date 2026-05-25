export type ExampleCategory =
  | "Software Engineer"
  | "Frontend Developer"
  | "Backend Developer"
  | "Full Stack Developer"
  | "UI/UX Designer"
  | "Data Analyst"
  | "Product Manager"
  | "Marketing Specialist"
  | "Student CV"
  | "Freelancer CV"
  | "CEO / Executive CV";

export const EXAMPLE_CATEGORIES: ExampleCategory[] = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Data Analyst",
  "Product Manager",
  "Marketing Specialist",
  "Student CV",
  "Freelancer CV",
  "CEO / Executive CV",
];

export interface CVExampleProfile {
  id: string;
  slug: string;
  name: string;
  role: string;
  category: ExampleCategory;
  location: string;
  experience: string;
  skills: string[];
  summary: string;
  template: string;
  achievements: string[];
  company: string;
  education: string;
  views: number;
  uses: number;
  rating: number;
  atsScore: number;
  accentColor: string;
  cvContent: {
    personal: {
      fullName: string;
      title: string;
      email: string;
      phone: string;
      location: string;
      website?: string;
    };
    summary: string;
    experience: {
      title: string;
      company: string;
      startDate: string;
      endDate: string;
      description: string[];
    }[];
    education: {
      degree: string;
      university: string;
      graduationYear: string;
    }[];
    skills: string[];
    achievements: string[];
  };
}
