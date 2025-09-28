import { defineConfig, loadEnv } from "vite"; // 引入 Vite 配置和环境变量加载方法
import vue from "@vitejs/plugin-vue"; // Vue 3 插件
import AutoImport from "unplugin-auto-import/vite"; // 自动按需导入插件
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"; // SVG 图标插件
import path from "path"; // Node.js 路径模块
import Components from "unplugin-vue-components/vite"; // Vue 组件自动导入插件
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"; // Element Plus 组件解析器

import Icons from "unplugin-icons/vite"; // 图标自动导入插件
import IconsResolver from "unplugin-icons/resolver"; // 图标解析器

import vueDevTools from "vite-plugin-vue-devtools"; // Vue 调试工具插件

export default defineConfig(async ({ mode }) => {
  // 根据不同环境加载 .env 文件
  const env = loadEnv(mode, process.cwd());

  // 异步导入 UnoCSS 插件
  const UnoCss = await import("unocss/vite").then((i) => i.default);

  return {
    // 本地开发服务器配置
    server: {
      host: "0.0.0.0", // 可在局域网访问
      port: +env.VITE_APP_PORT, // 端口号从环境变量获取
      open: true, // 启动时自动打开浏览器
      proxy: {
        // 配置接口代理
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_APP_API_URL, // 代理目标地址
          changeOrigin: true, // 支持跨域
          rewrite: (pathStr) => pathStr.replace(new RegExp("^" + env.VITE_APP_BASE_API), ""), // 重写路径
        },
      },
    },
    plugins: [
      vue(), // Vue 支持
      vueDevTools(), // Vue 调试工具
      UnoCss(), // UnoCSS 插件
      AutoImport({
        imports: ["vue"], // 自动导入 vue 的相关函数

        dts: "src/types/auto-imports.d.ts", // 自动生成 TypeScript 声明文件
        eslintrc: {
          enabled: true, // 自动生成 ESLint 配置
          filepath: "./.eslintrc-auto-import.json", // ESLint 配置路径
        },
        resolvers: [
          ElementPlusResolver(), // 自动按需导入 Element Plus 组件
          IconsResolver({ prefix: "Icon" }), // 自动导入图标组件，前缀为 Icon
        ],
      }),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/assets/icons")], // SVG 图标存放目录
        symbolId: "icon-[dir]-[name]", // 图标 symbol id 格式
      }),
      Components({
        dirs: ["src/components", "src/views"], // 扫描组件和页面目录
        extensions: ["vue"], // 扫描 vue 文件
        deep: true, // 递归扫描子目录
        dts: "src/types/components.d.ts", // 自动生成 TypeScript 声明文件
        resolvers: [
          ElementPlusResolver(), // Element Plus 组件按需导入
          IconsResolver({ enabledCollections: ["ep"] }), // 图标集合 ep（Element Plus 图标）
        ],
      }),
      Icons({
        autoInstall: true, // 自动安装缺失的图标包
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          // 每个 scss 文件都自动引入变量文件
          additionalData: '@use "@/styles/variable.scss" as *;',
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), // 路径别名 @ 指向 src 目录
      },
    },
  };
});
