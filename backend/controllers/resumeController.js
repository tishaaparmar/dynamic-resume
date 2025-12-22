import Resume from "../models/Resume.js";
import { v4 as uuidv4 } from "uuid";
import * as jsondiffpatch from "jsondiffpatch";
import { resumeSnapshotToHTML, htmlToPdfBuffer } from "../utils/pdf.js";

const jdp = jsondiffpatch.create({
  objectHash: function (obj) {
    return obj && obj.id ? obj.id : JSON.stringify(obj);
  },
});

export const listResumes = async (req, res) => {
  const resumes = await Resume.find({ owner: req.userId }).select(
    "title description updatedAt"
  );
  res.json(resumes);
};

export const createResume = async (req, res) => {
  try {
    const {
      title = "Untitled Resume",
      initialSnapshot = {},
      message = "Initial commit",
    } = req.body;
    const resume = await Resume.create({
      owner: req.userId,
      title,
      description: "",
      current: initialSnapshot,
      versions: [
        { _id: uuidv4(), snapshot: initialSnapshot, message, createdAt: new Date() },
      ],
    });
    res.status(201).json(resume);
  } catch (error) {
    console.error("Error creating resume:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

// ✅ Duplicate resume functionality
export const duplicateResume = async (req, res) => {
  try {
    // ✅ Validate resume ID format
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    // ✅ Find the original resume
    const originalResume = await Resume.findById(id);
    if (!originalResume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    
    // ✅ Check ownership
    if (String(originalResume.owner) !== String(req.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ✅ Create a duplicate with a new title
    const duplicateTitle = `${originalResume.title} (Copy)`;
    const duplicateResume = await Resume.create({
      owner: req.userId,
      title: duplicateTitle,
      description: originalResume.description || "",
      current: originalResume.current,
      versions: originalResume.versions.map(v => ({
        _id: uuidv4(),
        snapshot: v.snapshot,
        message: v.message,
        createdAt: v.createdAt,
      })),
    });

    res.status(201).json(duplicateResume);
  } catch (error) {
    console.error("Error duplicating resume:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const getResume = async (req, res) => {
  try {
    // ✅ Validate resume ID format
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (String(resume.owner) !== String(req.userId))
      return res.status(403).json({ message: "Forbidden" });
    res.json(resume);
  } catch (error) {
    console.error("Error getting resume:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const updateResume = async (req, res) => {
  try {
    // ✅ Validate resume ID format
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const { snapshot = {}, message = "autosave", title } = req.body;
    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (String(resume.owner) !== String(req.userId))
      return res.status(403).json({ message: "Forbidden" });

    // ✅ Update title if provided
    if (title && title.trim() !== "") {
      resume.title = title.trim();
    }

    const version = {
      _id: uuidv4(),
      snapshot,
      message,
      createdAt: new Date(),
    };
    resume.versions.push(version);
    resume.current = snapshot;
    await resume.save();
    res.json({ ok: true, version, title: resume.title });
  } catch (error) {
    console.error("Error updating resume:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

// ✅ Update resume title only
export const updateResumeTitle = async (req, res) => {
  try {
    // ✅ Validate resume ID format
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const { title } = req.body;
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (String(resume.owner) !== String(req.userId))
      return res.status(403).json({ message: "Forbidden" });

    resume.title = title.trim();
    await resume.save();
    res.json({ ok: true, title: resume.title });
  } catch (error) {
    console.error("Error updating resume title:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const deleteResume = async (req, res) => {
  try {
    // ✅ Validate resume ID format
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (String(resume.owner) !== String(req.userId))
      return res.status(403).json({ message: "Forbidden" });
    await resume.deleteOne();
    res.json({ ok: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const listVersions = async (req, res) => {
  try {
    // ✅ Validate resume ID format
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const resume = await Resume.findById(id).select("versions");
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (String(resume.owner) !== String(req.userId))
      return res.status(403).json({ message: "Forbidden" });
    res.json(resume.versions);
  } catch (error) {
    console.error("Error listing versions:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const getVersion = async (req, res) => {
  try {
    // ✅ Validate resume ID format
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const resume = await Resume.findById(id).select("versions");
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (String(resume.owner) !== String(req.userId))
      return res.status(403).json({ message: "Forbidden" });
    const version = resume.versions.id(req.params.versionId);
    if (!version) return res.status(404).json({ message: "Version not found" });
    res.json(version);
  } catch (error) {
    console.error("Error getting version:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const compareVersions = async (req, res) => {
  try {
    // ✅ Validate resume ID format
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ message: "Both 'from' and 'to' version IDs are required" });
    }

    const resume = await Resume.findById(id).select("versions");
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (String(resume.owner) !== String(req.userId))
      return res.status(403).json({ message: "Forbidden" });

    const vFrom = resume.versions.id(from)?.snapshot;
    const vTo = resume.versions.id(to)?.snapshot;
    if (!vFrom || !vTo)
      return res.status(404).json({ message: "One or both versions not found" });

    const delta = jdp.diff(vFrom, vTo);
    res.json({ delta });
  } catch (error) {
    console.error("Error comparing versions:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const exportResumeJSON = async (req, res) => {
  try {
    // ✅ Validate resume ID format
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (String(resume.owner) !== String(req.userId))
      return res.status(403).json({ message: "Forbidden" });

    res.json({ id: resume._id, title: resume.title, snapshot: resume.current });
  } catch (error) {
    console.error("Error exporting JSON:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const createShareLink = async (req, res) => {
  try {
    // ✅ Validate resume ID format
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    const resume = await Resume.findById(id);
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (String(resume.owner) !== String(req.userId))
      return res.status(403).json({ message: "Forbidden" });

    const token = uuidv4();
    const days = parseInt(process.env.SHARE_LINK_EXPIRES_DAYS || "30", 10);
    resume.share = {
      token,
      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    };
    await resume.save();
    res.json({ url: `${process.env.CLIENT_URL}/share/${token}`, token });
  } catch (error) {
    console.error("Error creating share link:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const exportResumePDF = async (req, res) => {
  try {
    // ✅ Validate resume ID format (MongoDB ObjectId)
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid resume ID format" });
    }

    // ✅ Find resume and validate ownership
    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    
    if (String(resume.owner) !== String(req.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ✅ Generate HTML from resume snapshot
    const html = await resumeSnapshotToHTML(resume.current);
    console.log("Generated HTML length:", html.length);
    
    // ✅ Generate PDF buffer using Puppeteer
    const pdfBuffer = await htmlToPdfBuffer(html);

    // ✅ Ensure buffer is a proper Buffer instance
    const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

    // ✅ Validate PDF buffer is not empty
    if (!buffer || buffer.length === 0) {
      console.error("PDF buffer is empty");
      return res.status(500).json({ message: "Failed to generate PDF: empty buffer" });
    }

    // ✅ Validate PDF magic bytes (%PDF)
    const pdfHeader = buffer.slice(0, 4).toString();
    if (pdfHeader !== "%PDF") {
      console.error("Invalid PDF buffer - missing PDF header. First bytes:", buffer.slice(0, 20).toString());
      return res.status(500).json({ message: "Failed to generate PDF: invalid PDF format" });
    }

    console.log("PDF buffer is valid. Size:", buffer.length, "bytes");

    // ✅ Support both view and download modes via query parameter
    const viewMode = req.query.view === "true";
    const filename = `${resume.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
    
    // ✅ Set correct headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "no-cache");
    
    // ✅ Use 'inline' for viewing, 'attachment' for downloading
    if (viewMode) {
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    } else {
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    }

    // ✅ Send PDF buffer as binary data
    res.end(buffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    console.error("Error stack:", error.stack);
    // ✅ Ensure error response is sent only if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate PDF", error: error.message });
    }
  }
};

