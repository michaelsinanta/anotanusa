import eslintConfigPrettier from "eslint-config-prettier/flat";

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const customConfig = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
  tailwindFunctions: ["cn", "clsx"],
};

export default [customConfig, eslintConfigPrettier];