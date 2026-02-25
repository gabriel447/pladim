/**
 * Configuração das rotas da aplicação (Login, Dashboard) e proteção de navegação (Guards).
 */
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import { usePladimStore } from '@/stores/pladim'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const store = usePladimStore()
  
  if (!store.userEmail) {
    store.checkSession()
  }
  
  if (to.meta.requiresAuth && !store.userEmail) {
    next('/')
  } else if (to.path === '/' && store.userEmail) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
