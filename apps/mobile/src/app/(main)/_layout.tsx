import { Redirect, Stack } from "expo-router";

import { useSession } from "@/hooks/useSession";

export default function MainLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
