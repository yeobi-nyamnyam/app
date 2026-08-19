import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenApiDocument } from "./openapi/document";
import { healthRouter } from "./routes/health";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(healthRouter);

const openApiDocument = generateOpenApiDocument();
app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`API docs available at http://localhost:${port}/docs`);
});
