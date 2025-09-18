# 梦境解析应用管理后台（zhimengjing-frontend）

## 项目介绍

`zhimengjing-frontend`是“梦境解析应用”的Web管理后台项目。该项目旨在为平台管理员提供一个功能全面、界面友好的仪表板，用于集中管理用户、梦境、社区内容以及各项系统配置，确保平台运营的高效和透明。

## 技术栈

本项目是基于 Vue 生态构建的，使用了以下主要技术：

- **前端框架**: Vue.js 3.x
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP 客户端**: Axios
- **样式预处理器**: SCSS

## 项目结构

项目遵循模块化设计，目录结构清晰，便于开发与维护：

```
dream-analysis-frontend/
├── public/                  # 静态资源
│   └── vite.svg
├── src/
│   ├── api/                 # API请求封装
│   │   └── auth.js
│   ├── assets/              # 静态资源，如图片和图标
│   ├── components/          # 公共组件，例如SVG图标组件
│   │   └── SvgIcon/
│   ├── router/              # 路由配置
│   │   ├── index.js
│   │   └── modules/
│   ├── store/               # Pinia状态管理
│   │   └── modules/
│   │       └── user.js
│   ├── styles/              # 样式文件和变量
│   │   ├── index.scss
│   │   └── variable.scss
│   ├── utils/               # 工具函数，如请求封装和进度条控制
│   │   ├── request.js
│   │   └── nprogress.js
│   └── views/               # 页面组件，如登录页和仪表板
│       └── Login/
├── index.html               # HTML入口文件
├── package.json             # 项目依赖和脚本
├── vite.config.js           # Vite配置
└── README.md                # 项目说明
```

## 功能模块

管理后台提供了多个关键模块，每个模块对应一个或多个页面：

1. **登录与认证**：
   - **登录页 (`admin-login.html`)**：提供管理员登录入口，包含用户名、密码输入，并支持模拟登录验证。
2. **核心管理**：
   - **仪表板 (`admin-dashboard.html`)**：展示平台关键数据，如用户数、梦境记录数和VIP用户数，并以图表形式展示用户增长趋势和梦境类型分布。
   - **用户管理 (`admin-users.html`)**：提供用户列表、状态筛选、信息编辑和删除等功能，并能查看VIP等级和梦境数量等信息。
   - **梦境管理 (`admin-dreams.html`)**：集中管理用户提交的梦境内容，支持审核、重新分析和批量操作。
   - **社区管理 (`admin-community.html`)**：用于审核和管理社区中用户分享的梦境和评论，确保内容合规性。
3. **高级配置**：
   - **AI配置 (`admin-ai-config.html`)**：允许管理员动态调整AI模型、API密钥和提示词模板等核心参数。
   - **系统设置 (`admin-settings.html`)**：管理平台的基本信息、安全策略、日志和数据备份等全局配置。
   - **报告管理 (`admin-reports.html`)**：查看和管理用户生成的梦境报告，支持下载和删除。
   - **数据统计 (`admin-analytics.html`)**：提供平台运营的统计数据，如用户增长趋势、收入分析等，支持导出报告。
   - **VIP管理 (`admin-vip.html`)**：管理VIP用户列表，包括续费、编辑和删除操作。

## 快速开始

1. **环境准备**:
   - 确保已安装最新版本的 [Node.js](https://nodejs.org/zh-cn/) 和 npm (或pnpm)。

2. **项目安装**:
   - 在项目根目录下，运行以下命令安装所有依赖：

     Bash

     ```
     npm install
     ```

3. **启动开发服务器**:
   - 运行以下命令启动项目：

     Bash

     ```
     npm run dev
     ```

4. **访问应用**:
   - 打开浏览器，访问 `http://localhost:3000` (或终端提示的地址)，即可进入登录页面。默认登录信息为：用户名 `admin`，密码 `admin123`。
