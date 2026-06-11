import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResumeSnapshot,
  ResumeSections,
  ResumeTemplate,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  SECTION_LABELS,
} from "@/types/resume";
import { TemplatePicker } from "./TemplatePicker";
import { SectionManager } from "./SectionManager";
import {
  User,
  FileText,
  Award,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Trophy,
  Medal,
  Users,
  Palette,
  LayoutGrid,
} from "lucide-react";

interface ResumeFormProps {
  data: ResumeSnapshot;
  onChange: (data: ResumeSnapshot) => void;
  readOnly?: boolean;
}

const emptyExperience = (): ExperienceEntry => ({
  title: "",
  company: "",
  location: "",
  period: "",
  description: "",
  bullets: [],
});

const emptyEducation = (): EducationEntry => ({
  degree: "",
  school: "",
  location: "",
  period: "",
  minor: "",
  coursework: "",
  gpa: "",
});

const emptyProject = (): ProjectEntry => ({
  name: "",
  technologies: "",
  description: "",
  bullets: [],
});

const bulletsToText = (bullets: string[]) => bullets.join("\n");
const textToBullets = (text: string) =>
  text.split("\n").map((l) => l.trim()).filter(Boolean);

// Define components outside of the main component to prevent recreating them on every render
interface ListCardProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onAdd?: () => void;
  emptyText?: string;
  count?: number;
  readOnly: boolean;
  isVisible?: boolean;
}

const ListCard = ({
  title,
  icon: Icon,
  children,
  onAdd,
  emptyText,
  count,
  readOnly,
  isVisible = true,
}: ListCardProps) => {
  if (!isVisible) return null;
  return (
    <Card className="card-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center">
            <Icon className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
          {!readOnly && onAdd && (
            <Button variant="outline" size="sm" onClick={onAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
        {count === 0 && emptyText && (
          <p className="text-center py-6 text-muted-foreground text-sm">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface RemoveBtnProps {
  onRemove: () => void;
  readOnly: boolean;
}

const RemoveBtn = ({ onRemove, readOnly }: RemoveBtnProps) =>
  !readOnly ? (
    <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive">
      <Trash2 className="w-4 h-4" />
    </Button>
  ) : null;

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  readOnly: boolean;
}

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  readOnly,
}: FieldProps) =>
  multiline ? (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={readOnly}
        className="input-elegant min-h-[80px] resize-none"
      />
    </div>
  ) : (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={readOnly}
        className="input-elegant"
      />
    </div>
  );

export const ResumeForm = ({ data, onChange, readOnly = false }: ResumeFormProps) => {
  const patch = (partial: Partial<ResumeSnapshot>) => onChange({ ...data, ...partial });
  const patchSections = (sections: ResumeSections) => patch({ sections });
  const patchPersonal = (field: string, value: string) =>
    patch({ personalInfo: { ...data.personalInfo, [field]: value } });

  return (
    <div className="space-y-6">
      {/* Template & Sections */}
      <Card className="card-soft">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Choose Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TemplatePicker
            value={data.template}
            onChange={(t: ResumeTemplate) => patch({ template: t })}
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      <Card className="card-soft">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <LayoutGrid className="w-5 h-5 mr-2" />
            Resume Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SectionManager sections={data.sections} onChange={patchSections} disabled={readOnly} />
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="card-soft">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name *" value={data.personalInfo.name} onChange={(v) => patchPersonal("name", v)} placeholder="Tisha Parmar" readOnly={readOnly} />
            <Field label="Email *" value={data.personalInfo.email} onChange={(v) => patchPersonal("email", v)} placeholder="you@email.com" readOnly={readOnly} />
            <Field label="Phone" value={data.personalInfo.phone} onChange={(v) => patchPersonal("phone", v)} placeholder="+91 98765 43210" readOnly={readOnly} />
            <Field label="Location" value={data.personalInfo.location} onChange={(v) => patchPersonal("location", v)} placeholder="Mumbai, India" readOnly={readOnly} />
            <Field label="GitHub" value={data.personalInfo.github} onChange={(v) => patchPersonal("github", v)} placeholder="github.com/username" readOnly={readOnly} />
            <Field label="LinkedIn" value={data.personalInfo.linkedin} onChange={(v) => patchPersonal("linkedin", v)} placeholder="linkedin.com/in/username" readOnly={readOnly} />
            <Field label="Website" value={data.personalInfo.website} onChange={(v) => patchPersonal("website", v)} placeholder="yourportfolio.com" readOnly={readOnly} />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {data.sections.summary && (
        <Card className="card-soft">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {SECTION_LABELS.summary}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.summary}
              onChange={(e) => patch({ summary: e.target.value })}
              disabled={readOnly}
              className="input-elegant min-h-[100px] resize-none"
              placeholder="Brief professional summary (optional)..."
            />
          </CardContent>
        </Card>
      )}

      {/* Education */}
      <ListCard
        title={SECTION_LABELS.education}
        icon={GraduationCap}
        isVisible={data.sections.education}
        readOnly={readOnly}
        count={data.education.length}
        emptyText='No education yet. Click "Add" to get started.'
        onAdd={() => patch({ education: [...data.education, emptyEducation()] })}
      >
        {data.education.map((edu, i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-sm">Education #{i + 1}</span>
              <RemoveBtn onRemove={() => patch({ education: data.education.filter((_, j) => j !== i) })} readOnly={readOnly} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="School / University" value={edu.school} onChange={(v) => { const e = [...data.education]; e[i] = { ...e[i], school: v }; patch({ education: e }); }} placeholder="University Name" readOnly={readOnly} />
              <Field label="Degree / Major" value={edu.degree} onChange={(v) => { const e = [...data.education]; e[i] = { ...e[i], degree: v }; patch({ education: e }); }} placeholder="B.Tech in CSE" readOnly={readOnly} />
              <Field label="Location" value={edu.location} onChange={(v) => { const e = [...data.education]; e[i] = { ...e[i], location: v }; patch({ education: e }); }} placeholder="Mumbai, India" readOnly={readOnly} />
              <Field label="Period" value={edu.period} onChange={(v) => { const e = [...data.education]; e[i] = { ...e[i], period: v }; patch({ education: e }); }} placeholder="07/2023 – Present" readOnly={readOnly} />
              <Field label="Minor (optional)" value={edu.minor} onChange={(v) => { const e = [...data.education]; e[i] = { ...e[i], minor: v }; patch({ education: e }); }} placeholder="Minor in AI" readOnly={readOnly} />
              <Field label="CGPA / Percentage" value={edu.gpa} onChange={(v) => { const e = [...data.education]; e[i] = { ...e[i], gpa: v }; patch({ education: e }); }} placeholder="8.5 / 10" readOnly={readOnly} />
            </div>
            <Field label="Relevant Coursework" value={edu.coursework} onChange={(v) => { const e = [...data.education]; e[i] = { ...e[i], coursework: v }; patch({ education: e }); }} placeholder="DSA, OS, DBMS, ML..." readOnly={readOnly} />
          </div>
        ))}
      </ListCard>

      {/* Skills */}
      <ListCard
        title={SECTION_LABELS.skills}
        icon={Award}
        isVisible={data.sections.skills}
        readOnly={readOnly}
        count={data.skills.length}
        emptyText='Add skill categories like "Languages: Python, Java"'
        onAdd={() => patch({ skills: [...data.skills, { category: "", items: "" }] })}
      >
        {data.skills.map((s, i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-sm">Category #{i + 1}</span>
              <RemoveBtn onRemove={() => patch({ skills: data.skills.filter((_, j) => j !== i) })} readOnly={readOnly} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Category" value={s.category} onChange={(v) => { const sk = [...data.skills]; sk[i] = { ...sk[i], category: v }; patch({ skills: sk }); }} placeholder="Languages" readOnly={readOnly} />
              <div className="md:col-span-2">
                <Field label="Skills (comma-separated)" value={s.items} onChange={(v) => { const sk = [...data.skills]; sk[i] = { ...sk[i], items: v }; patch({ skills: sk }); }} placeholder="Python, Java, C++" readOnly={readOnly} />
              </div>
            </div>
          </div>
        ))}
      </ListCard>

      {/* Experience */}
      <ListCard
        title={SECTION_LABELS.experience}
        icon={Briefcase}
        isVisible={data.sections.experience}
        readOnly={readOnly}
        count={data.experience.length}
        emptyText="Add your work experience"
        onAdd={() => patch({ experience: [...data.experience, emptyExperience()] })}
      >
        {data.experience.map((exp, i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-sm">Experience #{i + 1}</span>
              <RemoveBtn onRemove={() => patch({ experience: data.experience.filter((_, j) => j !== i) })} readOnly={readOnly} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Job Title" value={exp.title} onChange={(v) => { const e = [...data.experience]; e[i] = { ...e[i], title: v }; patch({ experience: e }); }} placeholder="Software Engineer" readOnly={readOnly} />
              <Field label="Company" value={exp.company} onChange={(v) => { const e = [...data.experience]; e[i] = { ...e[i], company: v }; patch({ experience: e }); }} placeholder="Company Name" readOnly={readOnly} />
              <Field label="Location" value={exp.location} onChange={(v) => { const e = [...data.experience]; e[i] = { ...e[i], location: v }; patch({ experience: e }); }} placeholder="Remote / City" readOnly={readOnly} />
              <Field label="Period" value={exp.period} onChange={(v) => { const e = [...data.experience]; e[i] = { ...e[i], period: v }; patch({ experience: e }); }} placeholder="Jan 2024 – Present" readOnly={readOnly} />
            </div>
            <Field label="Bullet points (one per line)" value={bulletsToText(exp.bullets)} onChange={(v) => { const e = [...data.experience]; e[i] = { ...e[i], bullets: textToBullets(v) }; patch({ experience: e }); }} placeholder="Built X feature that improved Y by 30%&#10;Led team of 5 engineers..." multiline readOnly={readOnly} />
          </div>
        ))}
      </ListCard>

      {/* Internships */}
      <ListCard
        title={SECTION_LABELS.internships}
        icon={Briefcase}
        isVisible={data.sections.internships}
        readOnly={readOnly}
        count={data.internships.length}
        emptyText="Add internship experiences"
        onAdd={() => patch({ internships: [...data.internships, emptyExperience()] })}
      >
        {data.internships.map((exp, i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-sm">Internship #{i + 1}</span>
              <RemoveBtn onRemove={() => patch({ internships: data.internships.filter((_, j) => j !== i) })} readOnly={readOnly} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Role" value={exp.title} onChange={(v) => { const e = [...data.internships]; e[i] = { ...e[i], title: v }; patch({ internships: e }); }} placeholder="SDE Intern" readOnly={readOnly} />
              <Field label="Company" value={exp.company} onChange={(v) => { const e = [...data.internships]; e[i] = { ...e[i], company: v }; patch({ internships: e }); }} placeholder="Company" readOnly={readOnly} />
              <Field label="Location" value={exp.location} onChange={(v) => { const e = [...data.internships]; e[i] = { ...e[i], location: v }; patch({ internships: e }); }} readOnly={readOnly} />
              <Field label="Period" value={exp.period} onChange={(v) => { const e = [...data.internships]; e[i] = { ...e[i], period: v }; patch({ internships: e }); }} readOnly={readOnly} />
            </div>
            <Field label="Bullet points (one per line)" value={bulletsToText(exp.bullets)} onChange={(v) => { const e = [...data.internships]; e[i] = { ...e[i], bullets: textToBullets(v) }; patch({ internships: e }); }} multiline readOnly={readOnly} />
          </div>
        ))}
      </ListCard>

      {/* Projects */}
      <ListCard
        title={SECTION_LABELS.projects}
        icon={FolderKanban}
        isVisible={data.sections.projects}
        readOnly={readOnly}
        count={data.projects.length}
        emptyText="Showcase your best projects"
        onAdd={() => patch({ projects: [...data.projects, emptyProject()] })}
      >
        {data.projects.map((proj, i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-sm">Project #{i + 1}</span>
              <RemoveBtn onRemove={() => patch({ projects: data.projects.filter((_, j) => j !== i) })} readOnly={readOnly} />
            </div>
            <Field label="Project Name" value={proj.name} onChange={(v) => { const p = [...data.projects]; p[i] = { ...p[i], name: v }; patch({ projects: p }); }} placeholder="AI Resume Builder" readOnly={readOnly} />
            <Field label="Technologies Used" value={proj.technologies} onChange={(v) => { const p = [...data.projects]; p[i] = { ...p[i], technologies: v }; patch({ projects: p }); }} placeholder="React, Node.js, MongoDB" readOnly={readOnly} />
            <Field label="Bullet points (one per line)" value={bulletsToText(proj.bullets)} onChange={(v) => { const p = [...data.projects]; p[i] = { ...p[i], bullets: textToBullets(v) }; patch({ projects: p }); }} multiline readOnly={readOnly} />
          </div>
        ))}
      </ListCard>

      {/* Certifications */}
      <ListCard
        title={SECTION_LABELS.certifications}
        icon={Medal}
        isVisible={data.sections.certifications}
        readOnly={readOnly}
        count={data.certifications.length}
        emptyText="Add certifications"
        onAdd={() => patch({ certifications: [...data.certifications, { name: "", issuer: "", date: "", description: "" }] })}
      >
        {data.certifications.map((cert, i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-sm">Certification #{i + 1}</span>
              <RemoveBtn onRemove={() => patch({ certifications: data.certifications.filter((_, j) => j !== i) })} readOnly={readOnly} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Name" value={cert.name} onChange={(v) => { const c = [...data.certifications]; c[i] = { ...c[i], name: v }; patch({ certifications: c }); }} readOnly={readOnly} />
              <Field label="Issuer" value={cert.issuer} onChange={(v) => { const c = [...data.certifications]; c[i] = { ...c[i], issuer: v }; patch({ certifications: c }); }} readOnly={readOnly} />
              <Field label="Date" value={cert.date} onChange={(v) => { const c = [...data.certifications]; c[i] = { ...c[i], date: v }; patch({ certifications: c }); }} readOnly={readOnly} />
            </div>
            <Field label="Description" value={cert.description} onChange={(v) => { const c = [...data.certifications]; c[i] = { ...c[i], description: v }; patch({ certifications: c }); }} multiline readOnly={readOnly} />
          </div>
        ))}
      </ListCard>

      {/* Achievements */}
      <ListCard
        title={SECTION_LABELS.achievements}
        icon={Trophy}
        isVisible={data.sections.achievements}
        readOnly={readOnly}
        count={data.achievements.length}
        emptyText="Add awards and achievements"
        onAdd={() => patch({ achievements: [...data.achievements, { title: "", date: "", description: "" }] })}
      >
        {data.achievements.map((a, i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-sm">Achievement #{i + 1}</span>
              <RemoveBtn onRemove={() => patch({ achievements: data.achievements.filter((_, j) => j !== i) })} readOnly={readOnly} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Title" value={a.title} onChange={(v) => { const arr = [...data.achievements]; arr[i] = { ...arr[i], title: v }; patch({ achievements: arr }); }} readOnly={readOnly} />
              <Field label="Date" value={a.date} onChange={(v) => { const arr = [...data.achievements]; arr[i] = { ...arr[i], date: v }; patch({ achievements: arr }); }} readOnly={readOnly} />
            </div>
            <Field label="Description" value={a.description} onChange={(v) => { const arr = [...data.achievements]; arr[i] = { ...arr[i], description: v }; patch({ achievements: arr }); }} multiline readOnly={readOnly} />
          </div>
        ))}
      </ListCard>

      {/* Leadership */}
      <ListCard
        title={SECTION_LABELS.leadership}
        icon={Users}
        isVisible={data.sections.leadership}
        readOnly={readOnly}
        count={data.leadership.length}
        emptyText="Add leadership roles & activities"
        onAdd={() => patch({ leadership: [...data.leadership, { role: "", organization: "", period: "", description: "" }] })}
      >
        {data.leadership.map((l, i) => (
          <div key={i} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-sm">Role #{i + 1}</span>
              <RemoveBtn onRemove={() => patch({ leadership: data.leadership.filter((_, j) => j !== i) })} readOnly={readOnly} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Role" value={l.role} onChange={(v) => { const arr = [...data.leadership]; arr[i] = { ...arr[i], role: v }; patch({ leadership: arr }); }} readOnly={readOnly} />
              <Field label="Organization" value={l.organization} onChange={(v) => { const arr = [...data.leadership]; arr[i] = { ...arr[i], organization: v }; patch({ leadership: arr }); }} readOnly={readOnly} />
              <Field label="Period" value={l.period} onChange={(v) => { const arr = [...data.leadership]; arr[i] = { ...arr[i], period: v }; patch({ leadership: arr }); }} readOnly={readOnly} />
            </div>
            <Field label="Description" value={l.description} onChange={(v) => { const arr = [...data.leadership]; arr[i] = { ...arr[i], description: v }; patch({ leadership: arr }); }} multiline readOnly={readOnly} />
          </div>
        ))}
      </ListCard>
    </div>
  );
};
