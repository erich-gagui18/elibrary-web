import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './views/Home.vue'
import Auth from './views/Auth.vue'
import Library from './views/Library.vue'
import Account from './views/Account.vue'

// Hash history works on any static host without server rewrites.
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Auth, props: { mode: 'login' } },
    { path: '/register', component: Auth, props: { mode: 'register' } },
    { path: '/account', component: Account },
    { path: '/library', component: Library, meta: { auth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
