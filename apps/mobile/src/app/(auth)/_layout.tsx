import { Redirect, Stack } from "expo-router";

import { useSession } from "@/hooks/useSession";

export default function AuthLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (session) {
    return <Redirect href="/(main)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
