import { Router } from "express";
import { z } from "zod";
import { registry } from "../openapi/registry";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireUser } from "../lib/requireUser";

const ErrorResponseSchema = z.object({
  message: z.string().openapi({ example: "인증 토큰이 필요합니다." }),
});

registry.registerPath({
  method: "delete",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "회원 탈퇴 (본인 계정 삭제)",
  description:
    "Authorization: Bearer <access_token> 헤더로 전달된 본인 계정을 Supabase Auth에서 " +
    "완전히 삭제한다. profiles 등 연관 테이블은 auth.users를 on delete cascade로 " +
    "참조하므로 함께 정리된다.",
  responses: {
    204: { description: "탈퇴 완료" },
    401: {
      description: "인증 토큰이 없거나 유효하지 않음",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    500: {
      description: "탈퇴 처리 중 오류",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

export const authRouter = Router();

authRouter.delete("/auth/me", requireUser, async (req, res) => {
  const { error: deleteError } = await getSupabaseAdmin().auth.admin.deleteUser(res.locals.userId);
  if (deleteError) {
    const body: z.infer<typeof ErrorResponseSchema> = { message: "탈퇴 처리 중 오류가 발생했습니다." };
    return res.status(500).json(body);
  }

  return res.status(204).send();
});
