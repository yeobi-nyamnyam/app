import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

const sentryDsn = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    // dev client(로컬 QA)와 실제 배포 빌드를 Sentry 대시보드에서 구분하기 위한 태그.
    environment: __DEV__ ? "development" : "production",
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  });
}
