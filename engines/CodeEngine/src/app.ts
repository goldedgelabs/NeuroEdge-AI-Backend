import express from "express";
import cors from "cors";
import CodeEngine from "./core/engine";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
    res.json({ status: "ok", engine: "CodeEngine" });
});

async function bootstrap() {
    await CodeEngine.start();
    const port = process.env.PORT || 7002;

    app.listen(port, () => {
        console.log(`🔥 Code Engine running on port ${port}`);
    });
}

bootstrap();
