<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { store, logout } from './store'

const router = useRouter()

const counter = computed(() => {
  const s = store.status
  if (!s) return ''
  return `${store.user ? 'Member' : 'Guest'}: ${s.remaining} of ${s.limit} downloads left`
})

async function signOut() {
  await logout()
  router.push('/')
}
</script>

<template>
  <header class="top">
    <RouterLink to="/" class="brand">E-Library</RouterLink>
    <nav aria-label="Main">
      <RouterLink to="/">Catalog</RouterLink>
      <RouterLink to="/library">My Library</RouterLink>
      <RouterLink to="/account">Account</RouterLink>
    </nav>
    <div class="account">
      <span v-if="counter" class="counter">{{ counter }}</span>
      <template v-if="store.user">
        <span class="who">{{ store.user.name || store.user.email }}</span>
        <button class="btn ghost" @click="signOut">Log out</button>
      </template>
      <template v-else>
        <RouterLink to="/login" class="btn ghost">Log in</RouterLink>
        <RouterLink to="/register" class="btn solid">Sign up</RouterLink>
      </template>
    </div>
  </header>

  <main>
    <RouterView />
  </main>

  <footer class="foot">
    Books come from Project Gutenberg. Every title is in the public domain.
  </footer>

  <div v-if="store.toast" class="toast" role="status">{{ store.toast }}</div>
</template>
