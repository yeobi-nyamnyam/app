import type { StorybookConfig } from "@storybook/react-vite";

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
        },
        extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js"],
      },
      define: {
        __DEV__: JSON.stringify(true),
        global: "globalThis",
      },
    });
  },
};

export default config;
