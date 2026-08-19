import { Router } from "express";
import { z } from "zod";
import { registry } from "../openapi/registry";

const HealthResponseSchema = z.object({
  status: z.literal("ok").openapi({ example: "ok" }),
});

registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["System"],
  summary: "서버 헬스 체크",
  responses: {
    200: {
      description: "정상 동작 중",
      content: {
        "application/json": {
          schema: HealthResponseSchema,
        },
      },
    },
  },
});

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const body: z.infer<typeof HealthResponseSchema> = { status: "ok" };
  res.json(body);
});
