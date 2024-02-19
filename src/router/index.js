import { createRouter, createWebHashHistory } from 'vue-router'
import Mainboard from "@/views/Mainboard.vue";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Mainboard
    }
  ]
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
