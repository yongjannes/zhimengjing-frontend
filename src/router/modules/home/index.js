const homeRoutes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login/index.vue"),
    meta: {
      title: "Login",
      keepAlive: true,
    },
  },
];

export default homeRoutes;
