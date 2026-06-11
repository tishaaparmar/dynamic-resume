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

function entryRow(left, right, sub) {
  return `<div class="entry">
    <div class="entry-main">
      <div class="entry-left">
        <div class="entry-title">${left}</div>
        ${sub ? `<div class="entry-sub">${sub}</div>` : ""}
      </div>
      ${right ? `<div class="entry-right">${right}</div>` : ""}
    </div>
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
    body { color: #1a1a1a; font-size: 10.5pt; line-height: 1.5; background: white; }
    .section { margin-bottom: 14px; page-break-inside: avoid; }
    .section-heading { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 14px 0 8px; page-break-after: avoid; }
    .section-heading.classic { border-bottom: 1px solid #1a1a1a; padding-bottom: 3px; }
    .section-heading.modern { border-left: 4px solid #2563eb; padding-left: 8px; color: #1d4ed8; }
    .section-heading.minimal { color: #64748b; letter-spacing: 0.15em; font-size: 9pt; border: none; }
    .section-heading.executive { background: #1e293b; color: white; padding: 6px 10px; margin-top: 16px; }
    .entry { margin-bottom: 10px; page-break-inside: avoid; }
    .entry-main { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .entry-left { flex: 1; }
    .entry-title { font-weight: 600; font-size: 10.5pt; }
    .entry-sub { font-style: italic; color: #475569; font-size: 9.5pt; margin-top: 1px; }
    .entry-right { text-align: right; font-size: 9.5pt; color: #64748b; white-space: nowrap; }
    .bullets { margin: 4px 0 0 16px; padding: 0; }
    .bullets li { margin-bottom: 2px; font-size: 10pt; color: #334155; }
    .skill-row { font-size: 10pt; margin-bottom: 3px; }
    .skill-cat { font-weight: 700; }
    p.summary { text-align: justify; color: #334155; font-size: 10pt; line-height: 1.55; }
    .edu-detail { font-size: 9.5pt; color: #475569; margin-top: 2px; }
  `;

  if (template === "classic") {
    return base + `
      body { font-family: 'Times New Roman', Georgia, serif; padding: 28px 36px; }
      .header { text-align: center; margin-bottom: 16px; page-break-inside: avoid; }
      .header h1 { font-size: 22pt; font-weight: 700; margin-bottom: 6px; }
      .contact { font-size: 9pt; color: #475569; line-height: 1.6; }
    `;
  }
  if (template === "modern") {
    return base + `
      body { font-family: Arial, Helvetica, sans-serif; padding: 28px 36px; }
      .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
      .header h1 { font-size: 24pt; font-weight: 700; color: #0f172a; }
      .contact { font-size: 9pt; color: #64748b; margin-top: 6px; }
    `;
  }
  if (template === "minimal") {
    return base + `
      body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 36px 44px; }
      .header { text-align: center; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
      .header h1 { font-size: 20pt; font-weight: 300; letter-spacing: 0.05em; }
      .contact { font-size: 8.5pt; color: #94a3b8; margin-top: 8px; }
    `;
  }
  // executive
  return base + `
    body { font-family: Arial, Helvetica, sans-serif; padding: 0; }
    .header { background: #1e293b; color: white; padding: 24px 36px; margin-bottom: 20px; }
    .header h1 { font-size: 26pt; font-weight: 700; color: white; }
    .contact { font-size: 9pt; color: #cbd5e1; margin-top: 8px; }
    .body-content { padding: 0 36px 28px; }
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

  const contactHtml = contacts.join(" &nbsp;|&nbsp; ");

  let body = "";

  if (sec.summary && data.summary) {
    body += `<div class="section">${sectionHeading("Professional Summary", template)}<p class="summary">${escapeHtml(data.summary)}</p></div>`;
  }

  if (sec.education && data.education.length) {
    body += `<div class="section">${sectionHeading("Education", template)}`;
    data.education.forEach((edu) => {
      body += entryRow(
        escapeHtml(edu.school),
        `${escapeHtml(edu.location)}${edu.period ? `<br>${escapeHtml(edu.period)}` : ""}`,
        escapeHtml(edu.degree)
      );
      if (edu.minor) body += `<div class="edu-detail">Minor: ${escapeHtml(edu.minor)}</div>`;
      if (edu.coursework) body += `<div class="edu-detail">Relevant Coursework: ${escapeHtml(edu.coursework)}</div>`;
      if (edu.gpa) body += `<div class="edu-detail"><strong>CGPA:</strong> ${escapeHtml(edu.gpa)}</div>`;
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
        escapeHtml(exp.title || exp.company),
        `${escapeHtml(exp.location)}${exp.period ? `<br>${escapeHtml(exp.period)}` : ""}`,
        exp.company && exp.title ? escapeHtml(exp.company) : ""
      );
      body += bulletList(exp.bullets, exp.description);
    });
    body += `</div>`;
  }

  if (sec.internships && data.internships.length) {
    body += `<div class="section">${sectionHeading("Internships", template)}`;
    data.internships.forEach((exp) => {
      body += entryRow(
        escapeHtml(exp.title || exp.company),
        `${escapeHtml(exp.location)}${exp.period ? `<br>${escapeHtml(exp.period)}` : ""}`,
        escapeHtml(exp.company)
      );
      body += bulletList(exp.bullets, exp.description);
    });
    body += `</div>`;
  }

  if (sec.projects && data.projects.length) {
    body += `<div class="section">${sectionHeading("Projects", template)}`;
    data.projects.forEach((proj) => {
      body += entryRow(
        `<strong>${escapeHtml(proj.name)}</strong>`,
        "",
        proj.technologies ? `<em>Technologies: ${escapeHtml(proj.technologies)}</em>` : ""
      );
      body += bulletList(proj.bullets, proj.description);
    });
    body += `</div>`;
  }

  if (sec.certifications && data.certifications.length) {
    body += `<div class="section">${sectionHeading("Certifications", template)}`;
    data.certifications.forEach((c) => {
      body += entryRow(escapeHtml(c.name), escapeHtml(c.date), escapeHtml(c.issuer));
      if (c.description) body += `<div class="edu-detail">${escapeHtml(c.description)}</div>`;
    });
    body += `</div>`;
  }

  if (sec.achievements && data.achievements.length) {
    body += `<div class="section">${sectionHeading("Achievements", template)}`;
    data.achievements.forEach((a) => {
      body += entryRow(escapeHtml(a.title), escapeHtml(a.date), "");
      if (a.description) body += `<div class="edu-detail">${escapeHtml(a.description)}</div>`;
    });
    body += `</div>`;
  }

  if (sec.leadership && data.leadership.length) {
    body += `<div class="section">${sectionHeading("Leadership & Activities", template)}`;
    data.leadership.forEach((l) => {
      body += entryRow(
        escapeHtml(`${l.role}${l.organization ? ` — ${l.organization}` : ""}`),
        escapeHtml(l.period),
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
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
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
