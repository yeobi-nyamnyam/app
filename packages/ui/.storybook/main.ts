import type { StorybookConfig } from "@storybook/react-vite";

const webExtensions = [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"];

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite");
    const path = await import("node:path");
    const require = (await import("node:module")).createRequire(
      import.meta.url,
    );
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          // react-native-svg ships native-only files (Fabric codegen) under its
          // default entry; alias straight to its web-only element implementations
          // so Vite/esbuild never has to resolve the native `react-native` deep
          // imports those files pull in.
          "react-native-svg": path.dirname(
            require.resolve("react-native-svg/package.json"),
          ) + "/lib/module/elements.web.js",
          // Point at the actual react-native-web install dir instead of the bare
          // package name — a plain string alias is used as a path prefix by
          // esbuild's dependency pre-bundling, and an unresolved relative value
          // gets treated as a filesystem path instead of a module specifier.
          "react-native": path.dirname(
            require.resolve("react-native-web/package.json"),
          ),
          // Flow-only syntax (`+foo`, `?number`, inexact `...`) that esbuild
          // can't parse; react-native-svg's web asset-uri resolver imports it
          // unconditionally even though it's unused for inline SVGs.
          "@react-native/assets-registry/registry": path.resolve(
            path.dirname(new URL(import.meta.url).pathname),
            "stubs/assets-registry-registry.js",
          ),
        },
        extensions: webExtensions,
      },
      define: {
        __DEV__: JSON.stringify(true),
        global: "globalThis",
      },
      optimizeDeps: {
        esbuildOptions: {
          resolveExtensions: webExtensions,
          // RN ecosystem packages (e.g. expo-blur's BlurView.web.js) ship JSX
          // inside plain .js files; esbuild's default loader for .js is "js",
          // which rejects JSX syntax. "automatic" avoids needing a `React` import
          // in scope (those files don't have one) by using the new JSX runtime.
          loader: { ".js": "jsx" },
          jsx: "automatic",
        },
      },
      // Same JSX settings for the dev-server's own transform pipeline (separate
      // from optimizeDeps' pre-bundling scan above) — without this, expo-blur's
      // web file gets re-transformed on request with the old classic JSX runtime
      // and throws "React is not defined".
      esbuild: {
        jsx: "automatic",
      },
    });
  },
};

export default config;
