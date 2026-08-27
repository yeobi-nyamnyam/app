import path from "path";
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
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          "react-native": "react-native-web",
          "@react-native/assets-registry/registry": path.join(
            __dirname,
            "./stubs/assetsRegistry.ts",
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
        },
      },
    });
  },
};

export default config;
