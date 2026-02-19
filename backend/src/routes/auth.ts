import express from "express";
import prisma from "../lib/prisma.js";
import { hashPassword, comparePassword, generateToken, verifyToken } from "../utils/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { email, password, nativeLanguage, targetLanguage, skillLevel } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                nativeLanguage: nativeLanguage || "en",
                targetLanguage: targetLanguage || "nl",
                skillLevel: skillLevel || "beginner",
            },
        });

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, nativeLanguage: user.nativeLanguage, targetLanguage: user.targetLanguage, skillLevel: user.skillLevel } });
    } catch (error) {
        res.status(500).json({ error: "Failed to register user" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await comparePassword(password, user.passwordHash))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, nativeLanguage: user.nativeLanguage, targetLanguage: user.targetLanguage, skillLevel: user.skillLevel } });
    } catch (error) {
        res.status(500).json({ error: "Failed to login" });
    }
});

router.get("/me", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: "Invalid token" });
        }
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ user: { id: user.id, email: user.email, nativeLanguage: user.nativeLanguage, targetLanguage: user.targetLanguage, skillLevel: user.skillLevel } });
    } catch (error) {
        res.status(500).json({ error: "Failed to get user" });
    }
});

export default router;
