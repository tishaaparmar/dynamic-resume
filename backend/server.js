// server.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import resumeRoutes from "./routes/resumes.js";
import shareRoutes from "./routes/share.js";

// Livereload
import connectLivereload from "connect-livereload";

const app = express();
const PORT = process.env.PORT || 4000;

// Optional: Use livereload in development
if (process.env.NODE_ENV === "development") {
  app.use(connectLivereload({ ignore: ['.pdf'] }));
}

app.use(helmet());
// ✅ JSON middleware - but PDF routes will send binary, so we handle that separately
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

// Allow frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/share", shareRoutes);

// Serve static PDF files safely
// Optional if you want to save PDFs on server and serve them
// import path from "path";
// app.use('/pdf', express.static(path.join(process.cwd(), 'pdfs')));

// Basic health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

async function start() {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

start().catch((err) => {
  console.error("Failed to start", err);
});
