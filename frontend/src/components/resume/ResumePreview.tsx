import { ResumeSnapshot, SECTION_LABELS } from "@/types/resume";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
  data: ResumeSnapshot;
  scale?: "sm" | "md" | "lg";
  className?: string;
}

// Top-level reusable helper components to prevent focus or mounting glitches
const SectionHeading = ({
  title,
  template,
  scale,
}: {
  title: string;
  template: string;
  scale: "sm" | "md" | "lg";
}) => {
  const isSm = scale === "sm";

  if (template === "executive") {
    return (
      <h2
        className={cn(
          "font-bold uppercase tracking-widest text-white bg-slate-800 px-3 py-1 mb-2 mt-4 first:mt-0",
          isSm ? "text-[8.5px] py-0.5 px-2" : "text-xs"
        )}
      >
        {title}
      </h2>
    );
  }
  if (template === "modern") {
    return (
      <h2
        className={cn(
          "font-bold uppercase tracking-wide text-blue-700 border-l-4 border-blue-600 pl-2 mb-2 mt-4 first:mt-0",
          isSm ? "text-[8.5px] border-l-2 pl-1.5" : "text-xs"
        )}
      >
        {title}
      </h2>
    );
  }
  if (template === "minimal") {
    return (
      <h2
        className={cn(
          "font-semibold uppercase tracking-[0.15em] text-gray-500 border-b border-gray-100 pb-0.5 mb-2 mt-5 first:mt-0",
          isSm ? "text-[7.5px]" : "text-[9.5px]"
        )}
      >
        {title}
      </h2>
    );
  }
  // classic
  return (
    <h2
      className={cn(
        "font-bold uppercase tracking-wide border-b border-gray-800 pb-0.5 mb-2 mt-4 first:mt-0 text-gray-900",
        isSm ? "text-[8.5px]" : "text-xs"
      )}
    >
      {title}
    </h2>
  );
};

const EntryRow = ({
  title,
  subtitle,
  rightTop,
  rightBottom,
  scale,
}: {
  title: string;
  subtitle?: string;
  rightTop?: string;
  rightBottom?: string;
  scale: "sm" | "md" | "lg";
}) => {
  const isSm = scale === "sm";
  return (
    <div className={isSm ? "mb-1.5" : "mb-3"}>
      <div className="flex justify-between items-baseline gap-4">
        <div className={cn("font-bold text-gray-900", isSm ? "text-[9.5px]" : "text-[10.5pt]")}>
          {title}
        </div>
        {rightTop && (
          <div className={cn("text-gray-700 font-semibold text-right whitespace-nowrap", isSm ? "text-[8px]" : "text-[9.5pt]")}>
            {rightTop}
          </div>
        )}
      </div>
      {(subtitle || rightBottom) && (
        <div className="flex justify-between items-baseline gap-4 mt-0.5">
          {subtitle && (
            <div className={cn("text-gray-600 italic", isSm ? "text-[8.5px]" : "text-[9.5pt]")}>
              {subtitle}
            </div>
          )}
          {rightBottom && (
            <div className={cn("text-gray-500 text-right whitespace-nowrap", isSm ? "text-[8px]" : "text-[9.5pt]")}>
              {rightBottom}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BulletList = ({ bullets, scale }: { bullets: string[]; scale: "sm" | "md" | "lg" }) => {
  const items = bullets.filter(Boolean);
  if (!items.length) return null;
  const isSm = scale === "sm";
  return (
    <ul
      className={cn(
        "list-disc list-outside ml-4 text-gray-700 space-y-0.5 leading-normal",
        isSm ? "text-[8px] mt-0.5 ml-3" : "text-[10pt] mt-1"
      )}
    >
      {items.map((b, i) => (
        <li key={i} className="pl-0.5">
          {b}
        </li>
      ))}
    </ul>
  );
};

export const ResumePreview = ({ data, scale = "md", className }: ResumePreviewProps) => {
  const { personalInfo: p, template, sections: sec } = data;
  const isSm = scale === "sm";

  const contactItems = [
    p.email && { text: p.email },
    p.phone && { text: p.phone },
    p.location && { text: p.location },
    p.github && { text: p.github },
    p.linkedin && { text: p.linkedin },
    p.website && { text: p.website },
  ].filter(Boolean) as { text: string }[];

  const contactText = contactItems.map(({ text }) => text).join("   •   ");

  // A4 Page styling classes
  const pageClass = cn(
    "bg-white shadow-md border border-gray-200 print:shadow-none print:border-none mx-auto text-left transition-all duration-200",
    isSm ? "p-4 w-full" : "p-[20mm] w-[210mm] min-h-[297mm] aspect-[1/1.414]",
    template === "classic" && "font-serif text-gray-900",
    template !== "classic" && "font-sans text-slate-800",
    className
  );

  return (
    <div className={pageClass}>
      {/* Header */}
      {template === "executive" ? (
        <div
          className={cn(
            "bg-slate-800 text-white mb-5",
            isSm ? "-mx-4 -mt-4 px-4 py-3" : "-mx-[20mm] -mt-[20mm] px-[20mm] py-[8mm]"
          )}
        >
          <h1 className={cn("font-bold tracking-tight text-white", isSm ? "text-base" : "text-3xl")}>
            {p.name || "Your Name"}
          </h1>
          {contactItems.length > 0 && (
            <div className={cn("text-gray-300 font-normal tracking-wide mt-1.5", isSm ? "text-[8px]" : "text-[9.5pt]")}>
              {contactText}
            </div>
          )}
        </div>
      ) : template === "minimal" ? (
        <div className={cn("text-center border-b border-gray-100 pb-3 mb-4", isSm ? "pb-2 mb-3" : "")}>
          <h1 className={cn("font-light tracking-[0.12em] uppercase text-gray-900", isSm ? "text-sm" : "text-2xl")}>
            {p.name || "Your Name"}
          </h1>
          {contactItems.length > 0 && (
            <div className={cn("text-gray-500 font-light mt-1.5", isSm ? "text-[8px]" : "text-[9pt]")}>
              {contactText}
            </div>
          )}
        </div>
      ) : template === "modern" ? (
        <div className={cn("border-b-2 border-blue-600 pb-3 mb-4", isSm ? "pb-2 mb-3" : "")}>
          <h1 className={cn("font-extrabold tracking-tight text-slate-900", isSm ? "text-base" : "text-3xl")}>
            {p.name || "Your Name"}
          </h1>
          {contactItems.length > 0 && (
            <div className={cn("text-slate-600 font-medium tracking-wide mt-1.5", isSm ? "text-[8px]" : "text-[9.5pt]")}>
              {contactText}
            </div>
          )}
        </div>
      ) : (
        // classic
        <div className={cn("text-center mb-4", isSm ? "mb-3" : "")}>
          <h1 className={cn("font-bold tracking-tight text-gray-900", isSm ? "text-lg" : "text-2xl")}>
            {p.name || "Your Name"}
          </h1>
          {contactItems.length > 0 && (
            <div className={cn("text-gray-600 font-normal mt-1.5", isSm ? "text-[8.5px]" : "text-[9.5pt]")}>
              {contactText}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {sec.summary && data.summary && (
        <section className={isSm ? "mb-3" : "mb-5"}>
          <SectionHeading title={SECTION_LABELS.summary} template={template} scale={scale} />
          <p
            className={cn(
              "text-gray-700 leading-relaxed text-justify",
              isSm ? "text-[8.5px]" : "text-[10pt]"
            )}
          >
            {data.summary}
          </p>
        </section>
      )}

      {/* Education */}
      {sec.education && data.education.length > 0 && (
        <section className={isSm ? "mb-3" : "mb-5"}>
          <SectionHeading title={SECTION_LABELS.education} template={template} scale={scale} />
          {data.education.map((edu, i) => (
            <div key={i} className={isSm ? "mb-2" : "mb-4"}>
              <EntryRow
                scale={scale}
                template={template}
                title={edu.school}
                subtitle={
                  edu.degree
                    ? `${edu.degree}${edu.minor ? `, Minor: ${edu.minor}` : ""}`
                    : edu.minor
                    ? `Minor: ${edu.minor}`
                    : undefined
                }
                rightTop={edu.period}
                rightBottom={edu.location}
              />
              {(edu.coursework || edu.gpa) && (
                <div className={cn("text-gray-600 mt-0.5", isSm ? "text-[8px]" : "text-[9.5pt]")}>
                  {edu.coursework && (
                    <div>
                      <span className="font-semibold">Relevant Coursework:</span> {edu.coursework}
                    </div>
                  )}
                  {edu.gpa && (
                    <div>
                      <span className="font-semibold">GPA / Percentage:</span> {edu.gpa}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {sec.skills && data.skills.length > 0 && (
        <section className={isSm ? "mb-3" : "mb-5"}>
          <SectionHeading title={SECTION_LABELS.skills} template={template} scale={scale} />
          <div className={isSm ? "space-y-0.5" : "space-y-1"}>
            {data.skills.map((s, i) =>
              s.category || s.items ? (
                <p
                  key={i}
                  className={cn(
                    "text-gray-700 leading-relaxed",
                    isSm ? "text-[8.5px]" : "text-[10pt]"
                  )}
                >
                  {s.category && <span className="font-bold text-gray-900">{s.category}: </span>}
                  {s.items}
                </p>
              ) : null
            )}
          </div>
        </section>
      )}

      {/* Experience */}
      {sec.experience && data.experience.length > 0 && (
        <section className={isSm ? "mb-3" : "mb-5"}>
          <SectionHeading title={SECTION_LABELS.experience} template={template} scale={scale} />
          {data.experience.map((exp, i) => (
            <div key={i} className={isSm ? "mb-2" : "mb-4"}>
              <EntryRow
                scale={scale}
                template={template}
                title={exp.title || exp.company}
                subtitle={exp.company && exp.title ? exp.company : undefined}
                rightTop={exp.period}
                rightBottom={exp.location}
              />
              <BulletList
                scale={scale}
                bullets={
                  exp.bullets.length
                    ? exp.bullets
                    : exp.description
                    ? [exp.description]
                    : []
                }
              />
            </div>
          ))}
        </section>
      )}

      {/* Internships */}
      {sec.internships && data.internships.length > 0 && (
        <section className={isSm ? "mb-3" : "mb-5"}>
          <SectionHeading title={SECTION_LABELS.internships} template={template} scale={scale} />
          {data.internships.map((exp, i) => (
            <div key={i} className={isSm ? "mb-2" : "mb-4"}>
              <EntryRow
                scale={scale}
                template={template}
                title={exp.title || exp.company}
                subtitle={exp.company}
                rightTop={exp.period}
                rightBottom={exp.location}
              />
              <BulletList
                scale={scale}
                bullets={
                  exp.bullets.length
                    ? exp.bullets
                    : exp.description
                    ? [exp.description]
                    : []
                }
              />
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {sec.projects && data.projects.length > 0 && (
        <section className={isSm ? "mb-3" : "mb-5"}>
          <SectionHeading title={SECTION_LABELS.projects} template={template} scale={scale} />
          {data.projects.map((proj, i) => (
            <div key={i} className={isSm ? "mb-2" : "mb-4"}>
              <EntryRow
                scale={scale}
                template={template}
                title={proj.name}
                subtitle={
                  proj.technologies ? `Technologies: ${proj.technologies}` : undefined
                }
              />
              <BulletList
                scale={scale}
                bullets={
                  proj.bullets.length
                    ? proj.bullets
                    : proj.description
                    ? [proj.description]
                    : []
                }
              />
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {sec.certifications && data.certifications.length > 0 && (
        <section className={isSm ? "mb-3" : "mb-5"}>
          <SectionHeading title={SECTION_LABELS.certifications} template={template} scale={scale} />
          {data.certifications.map((cert, i) => (
            <div key={i} className={isSm ? "mb-2" : "mb-3"}>
              <EntryRow
                scale={scale}
                template={template}
                title={cert.name}
                subtitle={cert.issuer}
                rightTop={cert.date}
              />
              {cert.description && (
                <p
                  className={cn(
                    "text-gray-700 mt-0.5 leading-normal",
                    isSm ? "text-[8px]" : "text-[9.5pt]"
                  )}
                >
                  {cert.description}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Achievements */}
      {sec.achievements && data.achievements.length > 0 && (
        <section className={isSm ? "mb-3" : "mb-5"}>
          <SectionHeading title={SECTION_LABELS.achievements} template={template} scale={scale} />
          {data.achievements.map((a, i) => (
            <div key={i} className={isSm ? "mb-2" : "mb-3"}>
              <EntryRow scale={scale} template={template} title={a.title} rightTop={a.date} />
              {a.description && (
                <p
                  className={cn(
                    "text-gray-700 mt-0.5 leading-normal",
                    isSm ? "text-[8px]" : "text-[9.5pt]"
                  )}
                >
                  {a.description}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Leadership */}
      {sec.leadership && data.leadership.length > 0 && (
        <section className={isSm ? "mb-3" : "mb-5"}>
          <SectionHeading title={SECTION_LABELS.leadership} template={template} scale={scale} />
          {data.leadership.map((l, i) => (
            <div key={i} className={isSm ? "mb-2" : "mb-3"}>
              <EntryRow
                scale={scale}
                template={template}
                title={l.role}
                subtitle={l.organization}
                rightTop={l.period}
              />
              {l.description && (
                <p
                  className={cn(
                    "text-gray-700 mt-0.5 leading-normal",
                    isSm ? "text-[8px]" : "text-[9.5pt]"
                  )}
                >
                  {l.description}
                </p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
