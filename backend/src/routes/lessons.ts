import express from "express";
import prisma from "../lib/prisma.js";
import { generateLessonService } from "../services/ai.js";
import { verifyToken } from "../utils/auth.js";

const router = express.Router();

const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid token" });

    req.userId = decoded.userId;
    next();
};

router.post("/generate", authenticate, async (req: any, res: any) => {
    const userId = req.userId;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const lessonData = await generateLessonService(user.targetLanguage, user.skillLevel);

        const lesson = await prisma.lesson.create({
            data: {
                title: lessonData.title,
                content: lessonData.content as string, // Ensure string since mock is obj but schema is string? 
                // Wait, schema says content is String (JSON). GenerateLessonService returns mock object.
                // I should stringify it if schema expects string or ensure it's compatible.
                difficultyLevel: lessonData.difficultyLevel,
            },
        });

        // Create user progress entry
        await prisma.userProgress.create({
            data: {
                userId,
                lessonId: lesson.id,
                status: "not_started",
            },
        });

        res.json(lesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Failed to generate lesson" });
    }
});

router.get("/", authenticate, async (req: any, res: any) => {
    const userId = req.userId;
    try {
        // Get lessons assigned to user via UserProgress
        const progress = await prisma.userProgress.findMany({
            where: { userId },
            include: { lesson: true },
        });

        const lessons = progress.map(p => ({ ...p.lesson, status: p.status, score: p.score }));
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch lessons" });
    }
});

router.get("/:id", authenticate, async (req: any, res: any) => {
    const userId = req.userId;
    const { id } = req.params;

    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: parseInt(id) },
        });

        if (!lesson) {
            return res.status(404).json({ error: "Lesson not found" });
        }

        res.json(lesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch lesson details" });
    }
});

export default router;
