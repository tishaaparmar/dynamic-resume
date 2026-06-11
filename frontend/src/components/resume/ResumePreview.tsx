import { ResumeSnapshot, SECTION_LABELS } from "@/types/resume";
import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Linkedin, Globe, Github } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeSnapshot;
  scale?: "sm" | "md" | "lg";
  className?: string;
}

const SectionHeading = ({ title, template }: { title: string; template: string }) => {
  if (template === "executive") {
    return (
      <h2 className="text-sm font-bold uppercase tracking-widest text-white bg-slate-800 px-3 py-1.5 mb-3 mt-5 first:mt-0">
        {title}
      </h2>
    );
  }
  if (template === "modern") {
    return (
      <h2 className="text-sm font-bold uppercase tracking-wide text-blue-700 border-l-4 border-blue-600 pl-3 mb-3 mt-5 first:mt-0">
        {title}
      </h2>
    );
  }
  if (template === "minimal") {
    return (
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-3 mt-6 first:mt-0">
        {title}
      </h2>
    );
  }
  // classic
  return (
    <h2 className="text-sm font-bold uppercase tracking-wide border-b border-gray-800 pb-1 mb-3 mt-4 first:mt-0">
      {title}
    </h2>
  );
};

const EntryRow = ({
  left,
  right,
  sub,
  template,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  sub?: React.ReactNode;
  template: string;
}) => (
  <div className="mb-3">
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className={cn("font-semibold text-gray-900", template === "minimal" ? "text-sm" : "text-base")}>
          {left}
        </div>
        {sub && <div className="text-sm text-gray-600 italic mt-0.5">{sub}</div>}
      </div>
      {right && (
        <div className="text-sm text-gray-600 whitespace-nowrap text-right shrink-0">{right}</div>
      )}
    </div>
  </div>
);

const BulletList = ({ bullets }: { bullets: string[] }) => {
  const items = bullets.filter(Boolean);
  if (!items.length) return null;
  return (
    <ul className="mt-1.5 space-y-1 list-disc list-outside ml-4 text-sm text-gray-700 leading-relaxed">
      {items.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
};

export const ResumePreview = ({ data, scale = "md", className }: ResumePreviewProps) => {
  const { personalInfo: p, template, sections: sec } = data;
  const scaleClass =
    scale === "sm" ? "text-[10px] leading-snug" : scale === "lg" ? "text-base" : "text-sm";

  const contactItems = [
    p.email && { icon: Mail, text: p.email },
    p.phone && { icon: Phone, text: p.phone },
    p.location && { icon: MapPin, text: p.location },
    p.github && { icon: Github, text: p.github },
    p.linkedin && { icon: Linkedin, text: p.linkedin },
    p.website && { icon: Globe, text: p.website },
  ].filter(Boolean) as { icon: typeof Mail; text: string }[];

  const headerClass = cn(
    "mb-5",
    template === "classic" && "text-center",
    template === "modern" && "border-b-2 border-blue-600 pb-4",
    template === "minimal" && "text-center pb-6 border-b border-gray-200",
    template === "executive" && "bg-slate-800 text-white -mx-8 -mt-8 px-8 pt-8 pb-6 mb-6 rounded-t-lg"
  );

  const nameClass = cn(
    "font-bold tracking-tight",
    template === "classic" && "text-2xl",
    template === "modern" && "text-3xl text-slate-900",
    template === "minimal" && "text-2xl font-light tracking-[0.05em]",
    template === "executive" && "text-3xl text-white"
  );

  const bodyClass = cn(
    "bg-white",
    scaleClass,
    template === "classic" && "font-serif px-8 py-8",
    template === "modern" && "font-sans px-8 py-8",
    template === "minimal" && "font-sans px-10 py-10",
    template === "executive" && "font-sans px-8 py-8",
    className
  );

  return (
    <div className={bodyClass}>
      {/* Header */}
      <div className={headerClass}>
        <h1 className={nameClass}>{p.name || "Your Name"}</h1>
        {contactItems.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs",
              template === "classic" && "justify-center text-gray-700",
              template === "executive" && "text-gray-300",
              template === "modern" && "text-gray-600 mt-3",
              template === "minimal" && "justify-center text-gray-500 mt-3"
            )}
          >
            {contactItems.map(({ icon: Icon, text }, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <Icon className="w-3 h-3 shrink-0" />
                <span>{text}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {sec.summary && data.summary && (
        <section>
          <SectionHeading title={SECTION_LABELS.summary} template={template} />
          <p className="text-gray-700 leading-relaxed text-justify">{data.summary}</p>
        </section>
      )}

      {/* Education */}
      {sec.education && data.education.length > 0 && (
        <section>
          <SectionHeading title={SECTION_LABELS.education} template={template} />
          {data.education.map((edu, i) => (
            <div key={i} className="mb-4">
              <EntryRow
                template={template}
                left={
                  <>
                    <span>{edu.school}</span>
                    {edu.degree && (
                      <span className="block font-normal text-gray-700 not-italic text-sm mt-0.5">
                        {edu.degree}
                      </span>
                    )}
                  </>
                }
                right={
                  <>
                    {edu.location && <div>{edu.location}</div>}
                    {edu.period && <div className="text-gray-500">{edu.period}</div>}
                  </>
                }
              />
              {edu.minor && <p className="text-sm text-gray-600 ml-0">Minor: {edu.minor}</p>}
              {edu.coursework && (
                <p className="text-sm text-gray-600">Relevant Coursework: {edu.coursework}</p>
              )}
              {edu.gpa && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">CGPA:</span> {edu.gpa}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {sec.skills && data.skills.length > 0 && (
        <section>
          <SectionHeading title={SECTION_LABELS.skills} template={template} />
          <div className="space-y-1">
            {data.skills.map((s, i) =>
              s.category || s.items ? (
                <p key={i} className="text-sm text-gray-700 leading-relaxed">
                  {s.category && <span className="font-semibold">{s.category}: </span>}
                  {s.items}
                </p>
              ) : null
            )}
          </div>
        </section>
      )}

      {/* Experience */}
      {sec.experience && data.experience.length > 0 && (
        <section>
          <SectionHeading title={SECTION_LABELS.experience} template={template} />
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <EntryRow
                template={template}
                left={exp.title || exp.company}
                sub={exp.company && exp.title ? exp.company : undefined}
                right={
                  <>
                    {exp.location && <div>{exp.location}</div>}
                    {exp.period && <div className="text-gray-500">{exp.period}</div>}
                  </>
                }
              />
              <BulletList bullets={exp.bullets.length ? exp.bullets : exp.description ? [exp.description] : []} />
            </div>
          ))}
        </section>
      )}

      {/* Internships */}
      {sec.internships && data.internships.length > 0 && (
        <section>
          <SectionHeading title={SECTION_LABELS.internships} template={template} />
          {data.internships.map((exp, i) => (
            <div key={i} className="mb-4">
              <EntryRow
                template={template}
                left={exp.title || exp.company}
                sub={exp.company}
                right={
                  <>
                    {exp.location && <div>{exp.location}</div>}
                    {exp.period && <div className="text-gray-500">{exp.period}</div>}
                  </>
                }
              />
              <BulletList bullets={exp.bullets.length ? exp.bullets : exp.description ? [exp.description] : []} />
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {sec.projects && data.projects.length > 0 && (
        <section>
          <SectionHeading title={SECTION_LABELS.projects} template={template} />
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-4">
              <EntryRow
                template={template}
                left={<span className="font-bold">{proj.name}</span>}
                sub={
                  proj.technologies ? (
                    <span className="italic text-gray-600">
                      Technologies Used: {proj.technologies}
                    </span>
                  ) : undefined
                }
              />
              <BulletList bullets={proj.bullets.length ? proj.bullets : proj.description ? [proj.description] : []} />
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {sec.certifications && data.certifications.length > 0 && (
        <section>
          <SectionHeading title={SECTION_LABELS.certifications} template={template} />
          {data.certifications.map((cert, i) => (
            <div key={i} className="mb-3">
              <EntryRow
                template={template}
                left={cert.name}
                sub={cert.issuer}
                right={cert.date}
              />
              {cert.description && (
                <p className="text-sm text-gray-700 ml-0">{cert.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Achievements */}
      {sec.achievements && data.achievements.length > 0 && (
        <section>
          <SectionHeading title={SECTION_LABELS.achievements} template={template} />
          {data.achievements.map((a, i) => (
            <div key={i} className="mb-3">
              <EntryRow template={template} left={a.title} right={a.date} />
              {a.description && <p className="text-sm text-gray-700">{a.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Leadership */}
      {sec.leadership && data.leadership.length > 0 && (
        <section>
          <SectionHeading title={SECTION_LABELS.leadership} template={template} />
          {data.leadership.map((l, i) => (
            <div key={i} className="mb-3">
              <EntryRow
                template={template}
                left={`${l.role}${l.organization ? ` — ${l.organization}` : ""}`}
                right={l.period}
              />
              {l.description && <p className="text-sm text-gray-700">{l.description}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
