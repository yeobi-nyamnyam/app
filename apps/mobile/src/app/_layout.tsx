import "@/lib/sentry";

import { useCallback, useEffect, useState } from "react";
import * as Sentry from "@sentry/react-native";
import { ApolloProvider } from "@apollo/client/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { apolloClient } from "@/lib/apollo";
import { SessionProvider } from "@/hooks/useSession";
import { AlertModalProvider } from "@/hooks/useAlertModal";
import { Splash } from "@/components/Splash";

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  // Metro가 폰트 에셋을 번들에 포함시키려면 정적으로 분석 가능한 require()가 필요함
  /* eslint-disable @typescript-eslint/no-require-imports */
  const [fontsLoaded] = useFonts({
    Pretendard: require("../../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../../assets/fonts/Pretendard-SemiBold.ttf"),
    "Pretendard-Bold": require("../../assets/fonts/Pretendard-Bold.ttf"),
    "WILDgag-Bold": require("../../assets/fonts/WILDgag-Bold.ttf"),
  });
  /* eslint-enable @typescript-eslint/no-require-imports */
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleIntroFinish = useCallback(() => setShowIntro(false), []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SessionProvider>
      <ApolloProvider client={apolloClient}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <AlertModalProvider>
              <StatusBar style="auto" />
              {showIntro ? (
                <Splash onFinish={handleIntroFinish} />
              ) : (
                <Stack screenOptions={{ headerShown: false }} />
              )}
            </AlertModalProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}

export default Sentry.wrap(RootLayout);
