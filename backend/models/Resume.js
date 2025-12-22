import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const versionSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  snapshot: { type: Object, default: {} }, // full resume JSON snapshot
  message: { type: String, default: "autosave" },
  createdAt: { type: Date, default: Date.now }
});

const shareSchema = new mongoose.Schema({
  token: String,
  expiresAt: Date
});

const resumeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "Untitled Resume" },
  description: { type: String, default: "" },
  current: { type: Object, default: {} }, // latest snapshot
  versions: [versionSchema],
  share: shareSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

resumeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Resume", resumeSchema);
