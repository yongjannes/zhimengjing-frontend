# vue-template

这是一个基于 Vue 3、Vite 和 JavaScript 的前端项目模板，旨在提供一个功能完善、配置齐全的开发起点。

## ✨ 功能特性

- **现代化的技术栈**:
  - 🚀 [Vue 3](https://vuejs.org/) (使用 `<script setup>`)
  - ⚡️ [Vite](https://vitejs.dev/)
- **状态管理**:
  - 🍍 [Pinia](https://pinia.vuejs.org/) - Vue 官方推荐的状态管理器。
- **路由**:
  - 🗺️ [Vue Router](https://router.vuejs.org/) - Vue 官方路由。
- **UI 组件库**:
  - 🧩 [Element Plus](https://element-plus.org/) - 一套为开发者、设计师和产品经理准备的基于 Vue 3.0 的桌面端组件库。
- **CSS 方案**:
  - 🎨 [UnoCSS](https://github.com/unocss/unocss) - 即时按需的原子化 CSS 引擎。
  - Preprocessor: [Sass/SCSS](https://sass-lang.com/)
- **HTTP 请求**:
  - 🌐 [Axios](https://axios-http.com/) - 经过封装，带有请求和响应拦截器。
- **代码规范和质量**:
  - ✅ [ESLint](https://eslint.org/) - 用于代码风格检查和修复。
  - ⚫️ [Prettier](https://prettier.io/) - 用于代码格式化。
  - 💅 [Stylelint](https://stylelint.io/) - 用于样式文件规范。
  - 🐶 [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged) - 在 Git 提交前自动执行代码检查和格式化。
  - 📄 [Commitlint](https://commitlint.js.org/) - 规范 Git 提交信息。
- **便捷开发**:
  - 📦 [自动导入](https://github.com/unplugin/unplugin-auto-import) - 自动按需导入 Vue API 和第三方库 API。
  - 📂 [组件自动导入](https://github.com/unplugin/unplugin-vue-components) - 自动按需导入组件。
  - 🖼️ [SVG 图标](https://github.com/vbenjs/vite-plugin-svg-icons) - 方便地在项目中使用 SVG 图标。

## 📦 安装与使用

本项目强制使用 `pnpm` 作为包管理器。

1. **克隆项目**

`   git clone https://gitee.com/yongjannes/vue-template.git  `

`cd vue-template  `

1. **安装依赖**

`   pnpm install   `

1. **启动开发服务器**

`   pnpm dev   `

1. **构建生产版本**

`   pnpm build   `

1. **预览生产版本**

`   pnpm preview   `

## 📜 可用脚本

在 `package.json` 文件中定义了以下脚本：

- `pnpm dev`: 启动开发服务器。
- `pnpm build`: 为生产环境构建项目。
- `pnpm preview`: 在本地预览生产构建产物。
- `pnpm format`: 使用 Prettier 格式化项目中的文件。
- `pnpm lint:eslint`: 使用 ESLint 检查并修复 `src` 目录下的脚本文件。
- `pnpm lint:stylelint`: 使用 Stylelint 检查并修复项目中的样式文件。
- `pnpm lint:lint-staged`: 运行 lint-staged（通常由 pre-commit 钩子触发）。

## ⚙️ 环境变量

项目通过 `.env` 文件来管理环境变量。

- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置
- `.env.test`: 测试环境配置

你可以在这些文件中配置以下变量：

- `VITE_APP_PORT`: 开发服务器运行的端口号。
- `VITE_APP_TITLE`: 项目标题。
- `VITE_APP_BASE_API`: API 请求的基础路径前缀。
- `VITE_APP_API_URL`: 后端 API 服务器的实际地址（用于代理）。

## 📁 项目结构

```
.
├── public/                # 静态资源，不会被 Vite 处理
├── src/
│   ├── api/               # API 请求模块
│   ├── assets/            # 静态资源 (会被 Vite 处理)
│   ├── components/        # 全局组件
│   ├── router/            # 路由配置
│   ├── store/             # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.js            # 应用入口文件
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── package.json           # 项目依赖和脚本
└── vite.config.js         # Vite 配置文件
```

## 🤝 贡献

欢迎提交 Pull Request 或 Issue 来改进这个项目模板。
