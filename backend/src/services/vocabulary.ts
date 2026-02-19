import prisma from "../lib/prisma.js";

// SuperMemo-2 Algorithm implementation
const calculateNextReview = (quality: number, interval: number, easeFactor: number) => {
    let newInterval: number;
    let newEaseFactor: number;

    if (quality >= 3) {
        if (interval === 0) {
            newInterval = 1;
        } else if (interval === 1) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * easeFactor);
        }

        newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEaseFactor < 1.3) newEaseFactor = 1.3;
    } else {
        newInterval = 1;
        newEaseFactor = easeFactor;
    }

    return { newInterval, newEaseFactor };
};

export const updateVocabularyProgress = async (vocabularyId: number, quality: number) => {
    const vocab = await prisma.vocabulary.findUnique({ where: { id: vocabularyId } });
    if (!vocab) throw new Error("Vocabulary not found");

    const { newInterval, newEaseFactor } = calculateNextReview(quality, vocab.interval, vocab.easeFactor);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return await prisma.vocabulary.update({
        where: { id: vocabularyId },
        data: {
            interval: newInterval,
            easeFactor: newEaseFactor,
            nextReviewDate,
            consecutiveCorrect: quality >= 3 ? vocab.consecutiveCorrect + 1 : 0,
        },
    });
};
