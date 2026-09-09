import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";

export const generateOpenApiDocument = () =>
  new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.0",
    info: {
      title: "여비냠냠 API",
      version: "0.1.0",
      description:
        "apps/server REST API 명세 (라우트에 등록된 zod 스키마로부터 자동 생성됩니다)",
    },
    servers: [{ url: "/" }],
  });
