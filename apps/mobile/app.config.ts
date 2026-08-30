import type { ExpoConfig } from "expo/config";
import {
  type ConfigPlugin,
  AndroidConfig,
  withAndroidManifest,
  withGradleProperties,
} from "expo/config-plugins";

// @mj-studio/react-native-naver-map@1.5.10의 Expo 플러그인은 구 인증 방식인
// com.naver.maps.map.CLIENT_ID 메타데이터만 넣는다. 최신 2.x 플러그인은
// NCP_KEY_ID 메타데이터도 같이 넣고 map-sdk도 더 최신 버전(3.23.2)을 받아오길래
// 이 두 가지를 동일하게 맞춰뒀다 — 다만 이것만으로는 여전히 지도 타일 인증이
// 401(Unauthorized client)로 거부된다. Android 패키지명 등록, NCP 결제수단 등록은
// 확인 완료된 상태라 원인은 NCP Application 쪽 등록 문제로 추정되며, 이 우회만으로는
// 해결되지 않으므로 계정 쪽 확인이 더 필요하다 (이슈 #83 참고).
// TODO(F3-1): 원인 확인되면 이 우회가 여전히 필요한지(불필요해지면 제거) 재점검할 것.
const NAVER_MAP_SDK_VERSION = "3.23.2";

const withNaverMapAuthWorkaround: ConfigPlugin<{ clientId: string }> = (
  config,
  { clientId },
) => {
  config = withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !(item.type === "property" && item.key === "NaverMap_sdkVersion"),
    );
    config.modResults.push({
      type: "property",
      key: "NaverMap_sdkVersion",
      value: NAVER_MAP_SDK_VERSION,
    });
    return config;
  });
  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults,
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      "com.naver.maps.map.NCP_KEY_ID",
      clientId,
    );
    return config;
  });
  return config;
};

const config: ExpoConfig = {
  name: "mobile",
  slug: "mobile",
  version: "0.0.0",
  scheme: "yeobinyamnyam",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  platforms: ["ios", "android"],
  android: {
    package: "com.yeobinyamnyam.mobile",
  },
  ios: {
    bundleIdentifier: "com.yeobinyamnyam.mobile",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "@react-native-google-signin/google-signin",
    [
      "@react-native-seoul/kakao-login",
      { kakaoAppKey: process.env.KAKAO_NATIVE_APP_KEY ?? "" },
    ],
    [
      "@mj-studio/react-native-naver-map",
      { client_id: process.env.NAVER_MAP_CLIENT_ID ?? "" },
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
  },
};

export default withNaverMapAuthWorkaround(config, {
  clientId: process.env.NAVER_MAP_CLIENT_ID ?? "",
});
