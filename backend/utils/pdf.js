// utils/pdf.js
import puppeteer from "puppeteer";

// ✅ Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

export async function resumeSnapshotToHTML(snapshot) {
  const personalInfo = snapshot.personalInfo || {};
  const name = escapeHtml(personalInfo.name || "Your Name");
  const email = escapeHtml(personalInfo.email || "");
  const phone = escapeHtml(personalInfo.phone || "");
  const location = escapeHtml(personalInfo.location || "");
  const linkedin = escapeHtml(personalInfo.linkedin || "");
  const website = escapeHtml(personalInfo.website || "");
  const summary = escapeHtml(snapshot.summary || "");
  const experience = Array.isArray(snapshot.experience) ? snapshot.experience : [];
  const education = Array.isArray(snapshot.education) ? snapshot.education : [];
  const skills = Array.isArray(snapshot.skills) ? snapshot.skills : [];

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>${name} - Resume</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            margin: 0;
            padding: 30px 40px;
            color: #1a1a1a;
            line-height: 1.6;
            background: white;
            font-size: 11pt;
          }
          .header { 
            text-align: center; 
            margin-bottom: 20px; 
            padding-bottom: 10px;
            page-break-inside: avoid;
          }
          h1 { 
            font-size: 28px; 
            margin: 0 0 8px 0; 
            color: #1e293b; 
            font-weight: 700;
            letter-spacing: -0.3px;
            font-family: 'Arial', 'Helvetica', sans-serif;
          }
          .contact-info { 
            font-size: 10pt; 
            color: #475569; 
            margin-top: 4px; 
            word-wrap: break-word;
            line-height: 1.6;
            font-family: 'Arial', 'Helvetica', sans-serif;
          }
          .contact-info a {
            color: #2563eb;
            text-decoration: none;
          }
          h2 { 
            font-size: 13pt; 
            margin-top: 18px; 
            margin-bottom: 10px;
            border-bottom: 1px solid #e2e8f0; 
            padding-bottom: 4px; 
            color: #1e293b;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-family: 'Arial', 'Helvetica', sans-serif;
            page-break-after: avoid;
          }
          .section { 
            margin-bottom: 18px; 
            page-break-inside: avoid;
          }
          .item { 
            margin-bottom: 14px; 
            page-break-inside: avoid;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px;
          }
          .title { 
            font-weight: 600; 
            font-size: 12pt; 
            color: #1e293b;
            font-family: 'Arial', 'Helvetica', sans-serif;
          }
          .subtitle { 
            font-style: italic; 
            color: #475569; 
            font-size: 10pt;
            margin-top: 1px;
            font-weight: 500;
          }
          .period { 
            font-size: 9pt; 
            color: #64748b; 
            font-weight: 500;
            white-space: nowrap;
            font-family: 'Arial', 'Helvetica', sans-serif;
          }
          .description {
            margin-top: 6px;
            color: #334155;
            font-size: 10pt;
            line-height: 1.5;
            text-align: justify;
          }
          .skills {
            margin-top: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .skills span {
            display: inline-block;
            padding: 4px 10px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 3px;
            font-size: 9pt;
            color: #334155;
            font-weight: 500;
          }
          p {
            margin-top: 6px;
            white-space: pre-wrap;
            word-wrap: break-word;
            text-align: justify;
            color: #334155;
            font-size: 10pt;
            line-height: 1.6;
          }
          .summary {
            text-align: justify;
            color: #334155;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${name}</h1>
          <div class="contact-info">
            ${email ? `<span>${email}</span>` : ""}
            ${phone ? ` • <span>${phone}</span>` : ""}
            ${location ? ` • <span>${location}</span>` : ""}
            ${linkedin ? `<br><span>LinkedIn: ${linkedin}</span>` : ""}
            ${website ? ` • <span>${website}</span>` : ""}
          </div>
        </div>

        ${summary ? `<div class="section"><h2>Professional Summary</h2><p class="summary">${summary}</p></div>` : ""}

        ${experience.length > 0 ? `
          <div class="section">
            <h2>Professional Experience</h2>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <div>
                    <div class="title">${escapeHtml(exp.title || "Job Title")}</div>
                    <div class="subtitle">${escapeHtml(exp.company || "")}</div>
                  </div>
                  <div class="period">${escapeHtml(exp.period || "")}</div>
                </div>
                ${exp.description ? `<div class="description">${escapeHtml(exp.description)}</div>` : ""}
              </div>
            `).join("")}
          </div>` : ""}

        ${education.length > 0 ? `
          <div class="section">
            <h2>Education</h2>
            ${education.map(edu => `
              <div class="item">
                <div class="item-header">
                  <div>
                    <div class="title">${escapeHtml(edu.degree || "Degree")}</div>
                    <div class="subtitle">${escapeHtml(edu.school || "")}</div>
                  </div>
                  <div class="period">${escapeHtml(edu.period || "")}</div>
                </div>
              </div>
            `).join("")}
          </div>` : ""}

        ${skills.length > 0 ? `
          <div class="section">
            <h2>Technical Skills</h2>
            <div class="skills">
              ${skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join("")}
            </div>
          </div>` : ""}
      </body>
    </html>
  `;
}

export async function htmlToPdfBuffer(html) {
  let browser;
  try {
    console.log("Launching Puppeteer browser...");
    // ✅ Launch browser with proper configuration
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Overcome limited resource problems
        "--disable-gpu", // Disable GPU for headless mode
      ],
    });
    
    console.log("Creating new page...");
    const page = await browser.newPage();
    
    // ✅ Set content and wait until DOM is fully rendered
    console.log("Setting HTML content...");
    await page.setContent(html, { 
      waitUntil: "networkidle0",
      timeout: 30000 // 30 second timeout
    });

    console.log("Generating PDF...");
    // ✅ Generate PDF with proper settings
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
    });

    console.log("PDF generated. Buffer type:", pdfBuffer.constructor.name, "Size:", pdfBuffer.length);

    // ✅ Validate PDF buffer before returning
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("Generated PDF buffer is empty");
    }

    // ✅ Ensure it's a Buffer instance
    const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    
    // ✅ Validate PDF magic bytes
    const header = buffer.slice(0, 4).toString();
    if (header !== "%PDF") {
      console.error("Invalid PDF header:", header, "First 20 bytes:", buffer.slice(0, 20).toString());
      throw new Error("Generated buffer is not a valid PDF");
    }

    console.log("PDF buffer validated successfully");
    return buffer;
  } catch (error) {
    console.error("Error in htmlToPdfBuffer:", error);
    console.error("Error stack:", error.stack);
    throw error;
  } finally {
    // ✅ Ensure browser is always closed
    if (browser) {
      try {
        await browser.close();
        console.log("Browser closed successfully");
      } catch (err) {
        console.error("Error closing browser:", err);
      }
    }
  }
}
