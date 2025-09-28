const homeRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login/index.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home/index.vue"),
    meta: { title: "首页", requiresAuth: true },
  },
];

export default homeRoutes;
