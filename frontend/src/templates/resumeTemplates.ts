import { ResumeTemplate } from "@/types/resume";

export interface TemplateConfig {
  id: ResumeTemplate;
  name: string;
  description: string;
  previewClass: string;
}

export const RESUME_TEMPLATES: TemplateConfig[] = [
  {
    id: "classic",
    name: "Classic Academic",
    description: "Centered header, serif typography — ideal for students & tech roles",
    previewClass: "template-classic",
  },
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean sans-serif with accent color — great for corporate roles",
    previewClass: "template-modern",
  },
  {
    id: "minimal",
    name: "Minimal Elegant",
    description: "Spacious layout with subtle dividers — stands out quietly",
    previewClass: "template-minimal",
  },
  {
    id: "executive",
    name: "Executive Bold",
    description: "Strong header band with structured sections — senior roles",
    previewClass: "template-executive",
  },
];

export const getTemplateConfig = (id: ResumeTemplate) =>
  RESUME_TEMPLATES.find((t) => t.id === id) || RESUME_TEMPLATES[0];
