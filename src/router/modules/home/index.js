const homeRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login/index.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/",
    name: "Layout", // 给布局一个名字
    component: () => import("@/layout/index.vue"),
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/Home/index.vue"),
        meta: { title: "首页", icon: "HomeFilled" },
      },
    ],
  },
];

export default homeRoutes;
