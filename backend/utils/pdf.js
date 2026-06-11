// utils/pdf.js
import puppeteer from "puppeteer";

function escapeHtml(text) {
  if (!text) return "";
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function normalizeSnapshot(snapshot) {
  const s = snapshot || {};
  const personalInfo = {
    name: "", email: "", phone: "", location: "", linkedin: "", website: "", github: "",
    ...(s.personalInfo || {}),
  };
  let skills = s.skills || [];
  if (skills.length && typeof skills[0] === "string") {
    skills = [{ category: "Skills", items: skills.join(", ") }];
  }
  const mapExp = (arr = []) =>
    arr.map((e) => ({
      title: e.title || "",
      company: e.company || "",
      location: e.location || "",
      period: e.period || "",
      description: e.description || "",
      bullets: e.bullets || (e.description ? e.description.split("\n").filter(Boolean) : []),
    }));
  return {
    template: s.template || "classic",
    sections: {
      summary: true, experience: true, internships: false, education: true,
      projects: true, skills: true, certifications: false, achievements: false, leadership: false,
      ...(s.sections || {}),
    },
    personalInfo,
    summary: s.summary || "",
    experience: mapExp(s.experience),
    internships: mapExp(s.internships),
    education: (s.education || []).map((e) => ({
      degree: e.degree || "", school: e.school || "", location: e.location || "",
      period: e.period || "", minor: e.minor || "", coursework: e.coursework || "", gpa: e.gpa || "",
    })),
    projects: (s.projects || []).map((p) => ({
      name: p.name || "", technologies: p.technologies || "",
      description: p.description || "", bullets: p.bullets || [],
    })),
    skills,
    certifications: s.certifications || [],
    achievements: s.achievements || [],
    leadership: s.leadership || [],
  };
}

function sectionHeading(title, template) {
  if (template === "executive") {
    return `<h2 class="section-heading executive">${escapeHtml(title)}</h2>`;
  }
  if (template === "modern") {
    return `<h2 class="section-heading modern">${escapeHtml(title)}</h2>`;
  }
  if (template === "minimal") {
    return `<h2 class="section-heading minimal">${escapeHtml(title)}</h2>`;
  }
  return `<h2 class="section-heading classic">${escapeHtml(title)}</h2>`;
}

function entryRow(title, subtitle, rightTop, rightBottom) {
  return `<div class="entry">
    <div class="entry-row">
      <span class="entry-title">${escapeHtml(title)}</span>
      ${rightTop ? `<span class="entry-right-top">${escapeHtml(rightTop)}</span>` : ""}
    </div>
    ${(subtitle || rightBottom) ? `
    <div class="entry-row sub-row">
      <span class="entry-subtitle">${escapeHtml(subtitle)}</span>
      ${rightBottom ? `<span class="entry-right-bottom">${escapeHtml(rightBottom)}</span>` : ""}
    </div>` : ""}
  </div>`;
}

function bulletList(bullets, fallback) {
  const items = (bullets?.length ? bullets : fallback ? [fallback] : []).filter(Boolean);
  if (!items.length) return "";
  return `<ul class="bullets">${items.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`;
}

function getTemplateStyles(template) {
  const base = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { color: #1f2937; font-size: 10.5pt; line-height: 1.45; background: white; -webkit-print-color-adjust: exact; }
    .section { margin-bottom: 12px; page-break-inside: avoid; }
    .section-heading { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 14px 0 8px; page-break-after: avoid; }
    
    .section-heading.classic { border-bottom: 1px solid #111827; padding-bottom: 2px; color: #111827; }
    .section-heading.modern { border-left: 4px solid #2563eb; padding-left: 8px; color: #1d4ed8; }
    .section-heading.minimal { color: #6b7280; letter-spacing: 0.15em; font-size: 9.5pt; border-bottom: 1px solid #f3f4f6; padding-bottom: 2px; }
    .section-heading.executive { background: #1e293b; color: white; padding: 4px 8px; margin-top: 14px; font-size: 10.5pt; }
    
    .entry { margin-bottom: 8px; page-break-inside: avoid; }
    .entry-row { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-title { font-weight: 700; font-size: 10.5pt; color: #111827; }
    .entry-right-top { font-weight: 600; font-size: 9.5pt; color: #374151; white-space: nowrap; }
    .sub-row { margin-top: 2px; }
    .entry-subtitle { font-style: italic; font-size: 9.5pt; color: #4b5563; }
    .entry-right-bottom { font-size: 9pt; color: #6b7280; white-space: nowrap; }
    
    .bullets { margin: 3px 0 0 16px; padding: 0; list-style-type: disc; }
    .bullets li { margin-bottom: 1.5px; font-size: 10pt; color: #374151; line-height: 1.4; }
    
    .skill-row { font-size: 10pt; margin-bottom: 4px; color: #374151; }
    .skill-cat { font-weight: 700; color: #111827; }
    p.summary { text-align: justify; color: #374151; font-size: 10pt; line-height: 1.45; }
    .edu-detail { font-size: 9.5pt; color: #4b5563; margin-top: 2px; line-height: 1.35; }
  `;

  if (template === "classic") {
    return base + `
      @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&display=swap');
      body { font-family: 'Crimson Pro', 'Times New Roman', Georgia, serif; padding: 20mm 20mm; }
      .header { text-align: center; margin-bottom: 16px; page-break-inside: avoid; }
      .header h1 { font-size: 24pt; font-weight: 700; margin-bottom: 4px; color: #111827; }
      .contact { font-size: 9.5pt; color: #4b5563; line-height: 1.5; }
    `;
  }
  if (template === "modern") {
    return base + `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      body { font-family: 'Inter', Arial, sans-serif; padding: 20mm 20mm; }
      .header { border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 16px; }
      .header h1 { font-size: 26pt; font-weight: 800; color: #111827; }
      .contact { font-size: 9.5pt; color: #4b5563; margin-top: 4px; }
    `;
  }
  if (template === "minimal") {
    return base + `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      body { font-family: 'Inter', Arial, sans-serif; padding: 20mm 20mm; }
      .header { text-align: center; padding-bottom: 12px; margin-bottom: 16px; border-bottom: 1px solid #f3f4f6; }
      .header h1 { font-size: 20pt; font-weight: 300; letter-spacing: 0.12em; text-transform: uppercase; color: #111827; }
      .contact { font-size: 9pt; color: #6b7280; margin-top: 6px; font-weight: 300; }
    `;
  }
  // executive
  return base + `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', Arial, sans-serif; padding: 0; }
    .header { background: #1e293b; color: white; padding: 8mm 20mm; margin-bottom: 16px; }
    .header h1 { font-size: 26pt; font-weight: 700; color: white; }
    .contact { font-size: 9.5pt; color: #cbd5e1; margin-top: 4px; }
    .body-content { padding: 0 20mm 20mm; }
  `;
}

export async function resumeSnapshotToHTML(snapshot) {
  const data = normalizeSnapshot(snapshot);
  const { personalInfo: p, template, sections: sec } = data;
  const name = escapeHtml(p.name || "Your Name");

  const contacts = [
    p.email && escapeHtml(p.email),
    p.phone && escapeHtml(p.phone),
    p.location && escapeHtml(p.location),
    p.github && escapeHtml(p.github),
    p.linkedin && escapeHtml(p.linkedin),
    p.website && escapeHtml(p.website),
  ].filter(Boolean);

  const contactHtml = contacts.join("   &bull;   ");

  let body = "";

  if (sec.summary && data.summary) {
    body += `<div class="section">${sectionHeading("Professional Summary", template)}<p class="summary">${escapeHtml(data.summary)}</p></div>`;
  }

  if (sec.education && data.education.length) {
    body += `<div class="section">${sectionHeading("Education", template)}`;
    data.education.forEach((edu) => {
      body += entryRow(
        edu.school,
        edu.degree ? `${edu.degree}${edu.minor ? `, Minor: ${edu.minor}` : ""}` : (edu.minor ? `Minor: ${edu.minor}` : ""),
        edu.period,
        edu.location
      );
      if (edu.coursework || edu.gpa) {
        body += `<div class="edu-detail">`;
        if (edu.coursework) body += `<div><strong>Relevant Coursework:</strong> ${escapeHtml(edu.coursework)}</div>`;
        if (edu.gpa) body += `<div><strong>GPA / Percentage:</strong> ${escapeHtml(edu.gpa)}</div>`;
        body += `</div>`;
      }
    });
    body += `</div>`;
  }

  if (sec.skills && data.skills.length) {
    body += `<div class="section">${sectionHeading("Skills", template)}`;
    data.skills.forEach((s) => {
      if (s.category || s.items) {
        body += `<div class="skill-row">${s.category ? `<span class="skill-cat">${escapeHtml(s.category)}:</span> ` : ""}${escapeHtml(s.items)}</div>`;
      }
    });
    body += `</div>`;
  }

  if (sec.experience && data.experience.length) {
    body += `<div class="section">${sectionHeading("Work Experience", template)}`;
    data.experience.forEach((exp) => {
      body += entryRow(
        exp.title || exp.company,
        exp.company && exp.title ? exp.company : "",
        exp.period,
        exp.location
      );
      body += bulletList(exp.bullets, exp.description);
    });
    body += `</div>`;
  }

  if (sec.internships && data.internships.length) {
    body += `<div class="section">${sectionHeading("Internships", template)}`;
    data.internships.forEach((exp) => {
      body += entryRow(
        exp.title || exp.company,
        exp.company,
        exp.period,
        exp.location
      );
      body += bulletList(exp.bullets, exp.description);
    });
    body += `</div>`;
  }

  if (sec.projects && data.projects.length) {
    body += `<div class="section">${sectionHeading("Projects", template)}`;
    data.projects.forEach((proj) => {
      body += entryRow(
        proj.name,
        proj.technologies ? `Technologies: ${proj.technologies}` : "",
        "",
        ""
      );
      body += bulletList(proj.bullets, proj.description);
    });
    body += `</div>`;
  }

  if (sec.certifications && data.certifications.length) {
    body += `<div class="section">${sectionHeading("Certifications", template)}`;
    data.certifications.forEach((c) => {
      body += entryRow(c.name, c.issuer, c.date, "");
      if (c.description) body += `<div class="edu-detail">${escapeHtml(c.description)}</div>`;
    });
    body += `</div>`;
  }

  if (sec.achievements && data.achievements.length) {
    body += `<div class="section">${sectionHeading("Achievements", template)}`;
    data.achievements.forEach((a) => {
      body += entryRow(a.title, "", a.date, "");
      if (a.description) body += `<div class="edu-detail">${escapeHtml(a.description)}</div>`;
    });
    body += `</div>`;
  }

  if (sec.leadership && data.leadership.length) {
    body += `<div class="section">${sectionHeading("Leadership & Activities", template)}`;
    data.leadership.forEach((l) => {
      body += entryRow(
        l.role,
        l.organization,
        l.period,
        ""
      );
      if (l.description) body += `<div class="edu-detail">${escapeHtml(l.description)}</div>`;
    });
    body += `</div>`;
  }

  const bodyWrap = template === "executive"
    ? `<div class="header"><h1>${name}</h1><div class="contact">${contactHtml}</div></div><div class="body-content">${body}</div>`
    : `<div class="header"><h1>${name}</h1><div class="contact">${contactHtml}</div></div>${body}`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${name} - Resume</title>
    <style>${getTemplateStyles(template)}</style></head><body>${bodyWrap}</body></html>`;
}

export async function htmlToPdfBuffer(html) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
    const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    if (!buffer?.length || buffer.slice(0, 4).toString() !== "%PDF") {
      throw new Error("Invalid PDF buffer");
    }
    return buffer;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}
