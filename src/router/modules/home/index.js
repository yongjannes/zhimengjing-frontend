const homeRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login/index.vue"),
    meta: { title: "登录", hidden: true },
  },
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    redirect: "/home",
    children: [
      {
        path: "/home",
        name: "Home",
        component: () => import("@/views/Home/index.vue"),
        meta: { title: "首页", icon: "HomeFilled" },
      },
      {
        path: "/user",
        name: "UserManagement",
        redirect: "/user/admin",
        meta: { title: "用户管理", icon: "User" },
        children: [
          {
            path: "/admin",
            name: "AdminUser",
            component: () => import("@/views/user/admin/index.vue"),
            meta: { title: "管理员用户", icon: "UserFilled" },
          },
          {
            path: "/normal",
            name: "NormalUser",
            component: () => import("@/views/user/normal/index.vue"),
            meta: { title: "普通用户", icon: "User" },
          },
        ],
      },
      {
        path: "/dream",
        name: "DreamManagement",
        component: () => import("@/views/dream/index.vue"),
        meta: { title: "梦境管理", icon: "Moon" },
      },
      {
        path: "/community",
        name: "CommunityManagement",
        component: () => import("@/views/community/index.vue"),
        meta: { title: "社区管理", icon: "ChatDotSquare" },
      },
      {
        path: "/ops",
        name: "OperationsManagement",
        redirect: "/ops/report",
        meta: { title: "运营管理", icon: "Opportunity" },
        children: [
          {
            path: "/report",
            name: "ReportManagement",
            component: () => import("@/views/ops/report/index.vue"),
            meta: { title: "报告管理", icon: "Document" },
          },
          {
            path: "/vip",
            name: "VipManagement",
            component: () => import("@/views/ops/vip/index.vue"),
            meta: { title: "VIP管理", icon: "UserFilled" },
          },
          {
            path: "/statistics",
            name: "DataStatistics",
            component: () => import("@/views/ops/statistics/index.vue"),
            meta: { title: "数据统计", icon: "PieChart" },
          },
        ],
      },
      {
        path: "/system",
        name: "SystemManagement",
        redirect: "/system/ai-config",
        meta: { title: "系统管理", icon: "Tools" },
        children: [
          {
            path: "/ai-config",
            name: "AiConfig",
            component: () => import("@/views/system/ai-config/index.vue"),
            meta: { title: "AI配置", icon: "Cpu" },
          },
          {
            path: "/config",
            name: "SystemConfig",
            component: () => import("@/views/system/config/index.vue"),
            meta: { title: "系统配置", icon: "Setting" },
          },
        ],
      },
    ],
  },
];

export default homeRoutes;
