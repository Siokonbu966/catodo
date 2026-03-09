import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  let base = "/"

  if (mode === "production") {
    base = "/catodo/"
  }
  return {
    plugins: [react()],
    base: base,
  };
})
