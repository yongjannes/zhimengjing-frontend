import NProgress from "nprogress";

import "nprogress/nprogress.css";

import "@/styles/nprogress-color.scss"; // SCSS 彩色样式

NProgress.configure({
  easing: "ease",

  speed: 1000,

  showSpinner: false,

  trickleSpeed: 200,

  minimum: 0.3,

  parent: "body",
});

export const start = () => NProgress.start();

export const close = () => NProgress.done();
