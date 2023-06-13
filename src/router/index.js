import { createRouter, createWebHashHistory } from "vue-router";
const Home = () => import("../pages/Home");
const About = () => import("../pages/About");

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/home", component: Home },
    { path: "/about", component: About },
  ],
});

export default router;
