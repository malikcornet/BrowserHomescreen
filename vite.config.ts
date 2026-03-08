import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  // On GitHub Actions, deploy under /<repo>/ so asset URLs resolve on Pages.
  base: process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
    },
  },
})
