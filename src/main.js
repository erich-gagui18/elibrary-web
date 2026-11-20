import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { init, store } from './store'
import './style.css'

const ready = init()

// Wait for the session check before guarding pages, so a refresh doesn't log you out of the UI.
router.beforeEach(async (to) => {
  if (to.meta.auth) {
    await ready
    if (!store.user) return { path: '/login', query: { redirect: to.fullPath } }
  }
})

createApp(App).use(router).mount('#app')
