import * as Sentry from "@sentry/node";

// Sentry의 자동 계측(http/express 등)이 각 모듈을 가로챌 수 있으려면, 이 파일이
// express 등을 import하는 다른 모든 코드보다 먼저 실행돼야 한다. 그래서
// index.ts의 첫 줄에서 이 파일만 import한다 (부수효과 목적, named export 없음).
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  });
}
