/**
 * 个人中心路由模块
 */
export default {
  path: "/profile",
  name: "ProfileLayout",
  component: () => import("@/layout/index.vue"),
  children: [
    {
      path: "",
      name: "Profile",
      component: () => import("@/views/profile/index.vue"),
      meta: {
        title: "个人中心",
        icon: "User",
        hidden: true, // 不在左侧菜单显示
      },
    },
  ],
};
