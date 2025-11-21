import express from "express";
import cors from "cors";
import CodeEngine from "./core/engine";

// Import routes
import executeRoute from "./routes/execute.route";
import refactorRoute from "./routes/refactor.route";
import embedRoute from "./routes/embed.route";
import searchRoute from "./routes/search.route";
import jobsRoute from "./routes/jobs.route";

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "ok", engine: "CodeEngine" });
});

// === Mount Routes ===
app.use("/execute", executeRoute);
app.use("/refactor", refactorRoute);
app.use("/embed", embedRoute);
app.use("/search", searchRoute);
app.use("/jobs", jobsRoute);

async function bootstrap() {
    await CodeEngine.start();

    const port = process.env.PORT || 7002;

    app.listen(port, () => {
        console.log(`🔥 Code Engine running on port ${port}`);
    });
}

bootstrap();

export default app;
