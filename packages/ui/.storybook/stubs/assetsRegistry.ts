// esbuild가 소스맵 없는 .js로 배포된 @react-native/assets-registry/registry의
// TS `export type` 구문을 파싱하지 못해 Storybook(web) 번들링이 깨짐.
// react-native-svg의 resolveAssetUri가 참조하지만 웹 프리뷰에서는 숫자 asset ID를
// 다루지 않으므로 no-op으로 대체.
export function getAssetByID() {
  return null
}
