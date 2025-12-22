import express from "express";
import {
  listResumes,
  createResume,
  getResume,
  updateResume,
  updateResumeTitle,
  deleteResume,
  listVersions,
  getVersion,
  compareVersions,
  exportResumeJSON,
  createShareLink,
  exportResumePDF,
  duplicateResume
} from "../controllers/resumeController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", listResumes);
router.post("/", createResume);
router.get("/:id", getResume);
router.put("/:id", updateResume); // autosave / commit
router.patch("/:id/title", updateResumeTitle); // ✅ Update title only
router.delete("/:id", deleteResume);
router.post("/:id/duplicate", duplicateResume); // ✅ Duplicate resume

router.get("/:id/versions", listVersions);
router.get("/:id/versions/:versionId", getVersion);
router.post("/:id/versions/compare", compareVersions);

router.post("/:id/export", exportResumeJSON);
router.get("/:id/export/pdf", exportResumePDF);
router.post("/:id/share", createShareLink);

export default router;
