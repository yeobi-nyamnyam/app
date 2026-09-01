import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocument } from "./openapi/document";
import { authRouter } from "./routes/auth";
import { chatRouter } from "./routes/chat";
import { diaryRouter } from "./routes/diary";
import { healthRouter } from "./routes/health";
import { ocrRouter } from "./routes/ocr";
import { recordRouter } from "./routes/record";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(express.json());
app.use(healthRouter);
app.use(authRouter);
app.use(recordRouter);
app.use(ocrRouter);
app.use(chatRouter);
app.use(diaryRouter);

const openApiDocument = generateOpenApiDocument();
app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`API docs available at http://localhost:${port}/docs`);
});
