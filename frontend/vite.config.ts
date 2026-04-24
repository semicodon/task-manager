/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

// @ts-ignore
interface ImportMeta {
  readonly env: ImportMetaEnv
}
