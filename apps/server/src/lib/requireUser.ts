import type { RequestHandler } from "express";
import { getSupabaseAdmin } from "./supabase";

// Authorization: Bearer <access_token>을 Supabase로 검증하고, 성공하면 res.locals.userId에
// 사용자 id를 담는다. 실패하면 401로 끝낸다 (각 라우트에 복사돼 있던 검증 코드를 한 곳으로).
export const requireUser: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;
  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }

  res.locals.userId = data.user.id;
  return next();
};
