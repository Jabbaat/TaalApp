import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import lessonRoutes from "./routes/lessons.js";
import vocabularyRoutes from "./routes/vocabulary.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
    res.send("Language Learning Companion API is running");
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
