import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// In development, /api is proxied to the Laravel server, so there are no CORS issues.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000', changeOrigin: true },
      },
    },
  }
})
