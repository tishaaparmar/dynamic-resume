export type ResumeTemplate = "classic" | "modern" | "minimal" | "executive";

export interface ResumeSections {
  summary: boolean;
  experience: boolean;
  internships: boolean;
  education: boolean;
  projects: boolean;
  skills: boolean;
  certifications: boolean;
  achievements: boolean;
  leadership: boolean;
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  github: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  bullets: string[];
}

export interface EducationEntry {
  degree: string;
  school: string;
  location: string;
  period: string;
  minor: string;
  coursework: string;
  gpa: string;
}

export interface ProjectEntry {
  name: string;
  technologies: string;
  description: string;
  bullets: string[];
}

export interface SkillCategory {
  category: string;
  items: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface AchievementEntry {
  title: string;
  date: string;
  description: string;
}

export interface LeadershipEntry {
  role: string;
  organization: string;
  period: string;
  description: string;
}

export interface ResumeSnapshot {
  template: ResumeTemplate;
  sections: ResumeSections;
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  internships: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: SkillCategory[];
  certifications: CertificationEntry[];
  achievements: AchievementEntry[];
  leadership: LeadershipEntry[];
}

export const DEFAULT_SECTIONS: ResumeSections = {
  summary: true,
  experience: true,
  internships: false,
  education: true,
  projects: true,
  skills: true,
  certifications: false,
  achievements: false,
  leadership: false,
};

export const createDefaultSnapshot = (): ResumeSnapshot => ({
  template: "classic",
  sections: { ...DEFAULT_SECTIONS },
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    github: "",
  },
  summary: "",
  experience: [],
  internships: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  leadership: [],
});

/** Merge legacy snapshots into the current schema */
export const normalizeSnapshot = (raw: Partial<ResumeSnapshot> | null | undefined): ResumeSnapshot => {
  const defaults = createDefaultSnapshot();
  if (!raw) return defaults;

  const personalInfo = { ...defaults.personalInfo, ...(raw.personalInfo || {}) };

  let skills: SkillCategory[] = defaults.skills;
  if (Array.isArray(raw.skills)) {
    if (raw.skills.length > 0 && typeof raw.skills[0] === "string") {
      skills = [{ category: "Skills", items: (raw.skills as unknown as string[]).join(", ") }];
    } else {
      skills = raw.skills as SkillCategory[];
    }
  }

  const mapExperience = (items: Partial<ExperienceEntry>[] = []) =>
    items.map((e) => ({
      title: e.title || "",
      company: e.company || "",
      location: e.location || "",
      period: e.period || "",
      description: e.description || "",
      bullets: e.bullets || (e.description ? e.description.split("\n").filter(Boolean) : []),
    }));

  const mapEducation = (items: Partial<EducationEntry>[] = []) =>
    items.map((e) => ({
      degree: e.degree || "",
      school: e.school || "",
      location: e.location || "",
      period: e.period || "",
      minor: e.minor || "",
      coursework: e.coursework || "",
      gpa: e.gpa || "",
    }));

  return {
    template: raw.template || defaults.template,
    sections: { ...defaults.sections, ...(raw.sections || {}) },
    personalInfo,
    summary: raw.summary || "",
    experience: mapExperience(raw.experience),
    internships: mapExperience(raw.internships),
    education: mapEducation(raw.education),
    projects: (raw.projects || []).map((p) => ({
      name: p.name || "",
      technologies: p.technologies || "",
      description: p.description || "",
      bullets: p.bullets || [],
    })),
    skills,
    certifications: (raw.certifications || []).map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
      description: c.description || "",
    })),
    achievements: (raw.achievements || []).map((a) => ({
      title: a.title || "",
      date: a.date || "",
      description: a.description || "",
    })),
    leadership: (raw.leadership || []).map((l) => ({
      role: l.role || "",
      organization: l.organization || "",
      period: l.period || "",
      description: l.description || "",
    })),
  };
};

export const SECTION_LABELS: Record<keyof ResumeSections, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  internships: "Internships",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
  leadership: "Leadership & Activities",
};
