import { Tabs } from "expo-router";

// 화면마다 @repo/ui의 NavBar를 직접 렌더링해서 디자인 토큰 기반 커스텀 탭바를
// 쓰고 있으므로, 이 레이아웃은 네이티브 탭바 UI 없이 탭별로 독립된 백스택만
// 제공하는 용도로 쓴다. 각 탭 폴더 안의 _layout.tsx가 그 탭의 Stack을 구성한다.
export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false }} tabBar={() => null} />;
}
