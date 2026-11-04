<script setup>
import { reactive, ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { login, register } from '../store'

const props = defineProps({ mode: { type: String, default: 'login' } })
const router = useRouter()
const isRegister = computed(() => props.mode === 'register')

const form = reactive({ name: '', email: '', password: '', password_confirmation: '' })
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  busy.value = true
  try {
    if (isRegister.value) await register(form)
    else await login(form)
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="auth">
    <h1>{{ isRegister ? 'Create your account' : 'Welcome back' }}</h1>
    <p class="lede">
      {{ isRegister ? 'Accounts get 10 downloads instead of 5, plus a library that follows you across devices.' : 'Log in to use your 10 downloads and your library.' }}
    </p>

    <form @submit.prevent="submit">
      <p v-if="error" class="notice" role="alert">{{ error }}</p>

      <template v-if="isRegister">
        <label for="name">Name</label>
        <input id="name" v-model="form.name" type="text" autocomplete="name" required />
      </template>

      <label for="email">Email</label>
      <input id="email" v-model="form.email" type="email" autocomplete="email" required />

      <label for="password">Password</label>
      <input id="password" v-model="form.password" type="password" :autocomplete="isRegister ? 'new-password' : 'current-password'" minlength="8" required />

      <template v-if="isRegister">
        <label for="confirm">Confirm password</label>
        <input id="confirm" v-model="form.password_confirmation" type="password" autocomplete="new-password" minlength="8" required />
      </template>

      <button class="btn solid" :disabled="busy">
        {{ busy ? 'Please wait' : isRegister ? 'Create account' : 'Log in' }}
      </button>
    </form>

    <p class="switch">
      <template v-if="isRegister">Already have an account? <RouterLink to="/login">Log in</RouterLink></template>
      <template v-else>New here? <RouterLink to="/register">Create an account</RouterLink></template>
      <br />
      <RouterLink to="/">Continue as guest</RouterLink>
    </p>
  </section>
</template>
