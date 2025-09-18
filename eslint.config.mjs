import globals from "globals";
import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import pluginPrettier from "eslint-plugin-prettier";
import * as parserVue from "vue-eslint-parser";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

// 读取 .eslintrc-auto-import.json
const autoImportESLint = JSON.parse(
  readFileSync(
    resolve(fileURLToPath(new URL("./.eslintrc-auto-import.json", import.meta.url))),
    "utf-8"
  )
);

const vueRecommendedRules = pluginVue.configs?.recommended?.rules || {};

export default [
  // 通用 JS 配置
  {
    ...js.configs.recommended,
    ignores: [
      "/dist",
      "/public",
      "/node_modules",
      "**/*.min.js",
      "**/*.config.mjs",
      "/src/manifest.json",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...(autoImportESLint.globals || {}),
        ...{
        },
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      ...autoImportESLint.rules,
      "no-debug": "off",
      "prettier/prettier": [
        "error",
        { endOfLine: "auto" },
      ],
    },
  },

  // JS 文件单独配置
  {
    files: ["**/*.?([cm])js"],
    rules: {
      // JS 专属规则可在此添加
    },
  },

  // Vue 文件配置
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: parserVue,
      parserOptions: { parser: "espree", sourceType: "module" },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...(autoImportESLint.globals || {}),
      },
    },
    plugins: { vue: pluginVue, prettier: pluginPrettier },
    processor: pluginVue.processors[".vue"],
    rules: {
      ...vueRecommendedRules,
      "no-unused-vars": "error",
      "vue/no-v-html": "off",
      "vue/require-default-prop": "off",
      "vue/multi-word-component-names": "off",
      "vue/html-self-closing": [
        "error",
        { html: { void: "always", normal: "always", component: "always" }, svg: "always", math: "always" },
      ],
      "prettier/prettier": [
        "error",
        { endOfLine: "auto" },
      ],
    },
  },
];
