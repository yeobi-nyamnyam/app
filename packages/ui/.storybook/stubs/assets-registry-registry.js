// Storybook (Vite/esbuild) stand-in for @react-native/assets-registry/registry.
// The real file uses Flow-only type syntax esbuild can't parse, and its
// behavior (resolving numeric `require(image)` asset ids from the Metro
// packager) isn't reachable from web Storybook stories anyway.
const assets = []

export function registerAsset(asset) {
  return assets.push(asset)
}

export function getAssetByID(assetId) {
  return assets[assetId - 1]
}
