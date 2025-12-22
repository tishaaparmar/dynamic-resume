import express from "express";
import Resume from "../models/Resume.js";

const router = express.Router();

// Publicly accessible by token
router.get("/:token", async (req, res) => {
  const resume = await Resume.findOne({ "share.token": req.params.token });
  if (!resume) return res.status(404).json({ message: "Not found" });

  const now = new Date();
  if (!resume.share?.expiresAt || resume.share.expiresAt < now) {
    return res.status(410).json({ message: "Share link expired" });
  }

  res.json({ title: resume.title, snapshot: resume.current });
});

export default router;
