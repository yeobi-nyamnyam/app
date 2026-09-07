import type { ExpoConfig } from "expo/config";

// .env의 NAVER_MAP_CLIENT_ID가 로컬에서 비어있을 때 쓰는 폴백 — 팀 공용 NCP 개발용 client id.
const NAVER_MAP_CLIENT_ID_FALLBACK = "d568thotkp";

const config: ExpoConfig = {
  name: "mobile",
  slug: "mobile",
  version: "0.0.0",
  scheme: "yeobinyamnyam",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  platforms: ["android"],
  // SDK 55부터 New Architecture가 항상 켜져 있어 newArchEnabled 설정 자체가
  // 제거됨 (이슈 #143 — 이제 별도 설정 없이 New Architecture로 고정).
  android: {
    package: "com.yeobinyamnyam.mobile",
  },
  ios: {
    bundleIdentifier: "com.yeobinyamnyam.mobile",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-splash-screen",
    "@sentry/react-native/expo",
    [
      "expo-image-picker",
      {
        cameraPermission: "영수증 촬영을 위해 카메라 접근 권한이 필요해요.",
        photosPermission: "영수증 사진 선택을 위해 사진 라이브러리 접근 권한이 필요해요.",
      },
    ],
    "@react-native-google-signin/google-signin",
    [
      "@react-native-kakao/core",
      {
        nativeAppKey: process.env.KAKAO_NATIVE_APP_KEY ?? "",
        // 카카오 로그인 인가 코드 리다이렉트("kakao{앱키}://oauth")를 받으려면
        // AuthCodeHandlerActivity가 AndroidManifest에 있어야 하는데, 이 플러그인은
        // 기본값이 false라 명시하지 않으면 매니페스트에 아예 안 들어간다.
        android: { authCodeHandlerActivity: true },
      },
    ],
    [
      "@mj-studio/react-native-naver-map",
      { client_id: process.env.NAVER_MAP_CLIENT_ID ?? NAVER_MAP_CLIENT_ID_FALLBACK },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission: "지도에서 현재 위치를 보여주기 위해 위치 권한이 필요해요.",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: [
            "https://devrepo.kakao.com/nexus/content/groups/public/",
            "https://repository.map.naver.com/archive/maven",
          ],
        },
      },
    ],
  ],
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    kakaoNativeAppKey: process.env.KAKAO_NATIVE_APP_KEY,
    naverMapClientId: process.env.NAVER_MAP_CLIENT_ID,
    naverMapStyleId: process.env.NAVER_MAP_STYLE_ID,
    sentryDsn: process.env.SENTRY_DSN,
  },
};

export default config;
