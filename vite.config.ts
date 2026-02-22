import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_URL ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@engine': path.resolve(__dirname, 'src/engine'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@data': path.resolve(__dirname, 'src/data'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@pages': path.resolve(__dirname, 'src/pages'),
    },
  },
})
