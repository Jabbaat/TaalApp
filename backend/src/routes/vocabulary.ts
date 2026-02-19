import express from "express";
import prisma from "../lib/prisma.js";
import { updateVocabularyProgress } from "../services/vocabulary.js";
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

router.post("/add", authenticate, async (req: any, res: any) => {
    const { word, translation } = req.body;
    const userId = req.userId;

    try {
        const vocab = await prisma.vocabulary.create({
            data: {
                userId,
                word,
                translation,
            },
        });
        res.json(vocab);
    } catch (error) {
        res.status(500).json({ error: "Failed to add vocabulary" });
    }
});

router.get("/review", authenticate, async (req: any, res: any) => {
    const userId = req.userId;
    const now = new Date();

    try {
        const dueVocab = await prisma.vocabulary.findMany({
            where: {
                userId,
                nextReviewDate: {
                    lte: now,
                },
            },
        });
        res.json(dueVocab);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch review items" });
    }
});

router.post("/review/:id", authenticate, async (req: any, res: any) => {
    const { id } = req.params;
    const { quality } = req.body; // 0-5 rating

    try {
        const updatedVocab = await updateVocabularyProgress(Number(id), quality);
        res.json(updatedVocab);
    } catch (error) {
        res.status(500).json({ error: "Failed to update progress" });
    }
});

export default router;
