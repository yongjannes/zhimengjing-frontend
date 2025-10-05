import profileRoute from "../profile";
export const constantRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login/index.vue"),
    meta: { title: "登录", hidden: true }, // hidden: true 表示不在菜单中显示
  },
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    redirect: "/home",
    children: [
      {
        // 使用相对路径，它会自动拼接在父路由 "/" 后面，解析为 "/home"
        path: "/home",
        name: "Home",
        component: () => import("@/views/Home/index.vue"),
        meta: { title: "首页", icon: "HomeFilled" },
      },
    ],
  },
  profileRoute,
  // 404 页面、500 页面等也应放在这里
];

export const asyncRoutes = [
  {
    path: "/user",
    name: "UserManagement",
    component: () => import("@/layout/index.vue"), // 多级菜单的父级需要一个布局组件
    redirect: "/user/admin",
    meta: { title: "用户管理", icon: "User", permission: "user:manage" }, // 父级菜单的权限标识
    children: [
      {
        path: "/user/admin",
        name: "AdminUser",
        component: () => import("@/views/user/admin/index.vue"),
        meta: { title: "管理员用户", icon: "UserFilled", permission: "user:admin:view" },
      },
      {
        path: "/user/role",
        name: "SystemRoleManagement",
        component: () => import("@/views/user/role/index.vue"),
        meta: { title: "角色管理", icon: "Avatar", permission: "user:role:manage" },
      },
      {
        path: "/user/normal",
        name: "NormalUser",
        component: () => import("@/views/user/normal/index.vue"),
        meta: { title: "普通用户", icon: "User", permission: "user:normal:view" },
      },
    ],
  },
  {
    path: "/dream",
    name: "DreamLayout",
    component: () => import("@/layout/index.vue"), // 单级菜单同样需要布局组件，以确保显示在主框架内
    children: [
      {
        path: "",
        name: "DreamManagement",
        component: () => import("@/views/dream/index.vue"),
        meta: { title: "梦境管理", icon: "Moon", permission: "dream:manage" },
      },
    ],
  },
  {
    path: "/community",
    name: "CommunityLayout",
    component: () => import("@/layout/index.vue"),
    children: [
      {
        path: "",
        name: "CommunityManagement",
        component: () => import("@/views/community/index.vue"),
        meta: { title: "社区管理", icon: "ChatDotSquare", permission: "community:manage" },
      },
    ],
  },
  {
    path: "/ops",
    name: "OpsManagement",
    component: () => import("@/layout/index.vue"),
    redirect: "/ops/report",
    meta: { title: "运营管理", icon: "Opportunity", permission: "ops:manage" },
    children: [
      {
        path: "/ops/report",
        name: "ReportManagement",
        component: () => import("@/views/ops/report/index.vue"),
        meta: { title: "报告管理", icon: "Document", permission: "ops:report:view" },
      },
      {
        path: "/ops/vip",
        name: "VipManagement",
        component: () => import("@/views/ops/vip/index.vue"),
        meta: { title: "VIP管理", icon: "UserFilled", permission: "ops:vip:manage" },
      },
      {
        path: "/ops/statistics",
        name: "DataStatistics",
        component: () => import("@/views/ops/statistics/index.vue"),
        meta: { title: "数据统计", icon: "PieChart", permission: "ops:stats:view" },
      },
    ],
  },
  {
    path: "/system",
    name: "SystemManagement",
    component: () => import("@/layout/index.vue"),
    redirect: "/system/ai-config",
    meta: { title: "系统管理", icon: "Tools", permission: "system:manage" },
    children: [
      {
        path: "/system/ai-config",
        name: "AiConfig",
        component: () => import("@/views/system/ai-config/index.vue"),
        meta: { title: "AI配置", icon: "Cpu", permission: "system:ai:config" },
      },
      {
        path: "/system/config",
        name: "SystemConfig",
        component: () => import("@/views/system/config/index.vue"),
        meta: { title: "系统配置", icon: "Setting", permission: "system:sys:config" },
      },
    ],
  },
];
//任意路由
export const anyRoute = {
  //任意路由
  path: "/:pathMatch(.*)*",
  redirect: "/404",
  name: "Any",
  meta: {
    title: "任意路由",
    hidden: true,
    icon: "DataLine",
  },
};
