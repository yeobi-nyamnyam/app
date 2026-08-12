import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'mobile',
  slug: 'mobile',
  version: '0.0.0',
  scheme: 'yeobinyamnyam',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  platforms: ['ios', 'android'],
  android: {
    package: 'com.yeobinyamnyam.mobile',
  },
  ios: {
    bundleIdentifier: 'com.yeobinyamnyam.mobile',
  },
  plugins: [
    'expo-router',
    '@react-native-google-signin/google-signin',
    ['@react-native-seoul/kakao-login', { kakaoAppKey: process.env.KAKAO_NATIVE_APP_KEY ?? '' }],
  ],
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    kakaoNativeAppKey: process.env.KAKAO_NATIVE_APP_KEY,
    naverMapClientId: process.env.NAVER_MAP_CLIENT_ID,
  },
}

export default config
