import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js"; // import middleware

const router = express.Router();

// Protected route to get current user
router.get("/me", authMiddleware, (req, res) => {
  // req.user is now set by middleware
  res.json({ user: req.user });
});

router.post("/register", register);
router.post("/signup", register); // alias for register
router.post("/login", login);

router.post("/logout", (req, res) => {
  res.clearCookie("token", { // make sure cookie name matches login
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.json({ message: "Logged out successfully" });
});

export default router;
