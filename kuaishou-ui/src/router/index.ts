/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/pages/index.vue') },
    { path: '/mcn', component: () => import('@/pages/mcn.vue') },
    { path: '/guild', component: () => import('@/pages/guild.vue') },
    { path: '/agency', component: () => import('@/pages/agency.vue') },
    { path: '/live-app', component: () => import('@/pages/live-app.vue') },
    { path: '/live-web', component: () => import('@/pages/live-web.vue') },
    { path: '/account', component: () => import('@/pages/account.vue') },
  ],
})

export default router
