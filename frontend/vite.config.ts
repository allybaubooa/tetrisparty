import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '192.168.100.96',
    port: '8080',
    proxy: {
      '/api' : {
        target: 'https://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },

  }

})
