const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// @apollo/client v4는 package.json "exports" 조건부 분기로
// React Native용 FinalizationRegistry 폴리필을 제공한다.
// Metro의 unstable_enablePackageExports 기본값이 false라 이 분기를 타지 못하고
// 웹용 코드(전역 FinalizationRegistry 직접 참조)로 폴백되어 Hermes에서 크래시가 난다.
config.resolver.unstable_enablePackageExports = true

module.exports = config
