<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { store, logout } from '../store'

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
  <section class="auth">
    <h1>Account</h1>

    <template v-if="store.user">
      <h2 class="who-name">{{ store.user.name }}</h2>
      <p class="lede">{{ store.user.email }}</p>
    </template>
    <template v-else>
      <h2 class="who-name">Browsing as a guest</h2>
      <p class="lede">Log in to save books to My Library and get 10 downloads.</p>
    </template>

    <p v-if="counter" class="counter pill">{{ counter }}</p>

    <div class="stack">
      <template v-if="store.user">
        <button class="btn ghost" @click="signOut">Log out</button>
      </template>
      <template v-else>
        <RouterLink to="/login" class="btn solid">Log in</RouterLink>
        <RouterLink to="/register" class="btn ghost">Create an account</RouterLink>
      </template>
    </div>
  </section>
</template>
