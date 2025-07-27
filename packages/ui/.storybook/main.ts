const config = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [],
  framework: {
    name: "@stencil/storybook-plugin"
  },
  staticDirs: ["./public"],
};

export default config;
