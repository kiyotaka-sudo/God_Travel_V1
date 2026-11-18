import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080'
  const wsTarget = env.VITE_WS_PROXY_TARGET || apiTarget.replace(/^http/, 'ws')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@store': path.resolve(__dirname, './src/store'),
        '@api': path.resolve(__dirname, './src/api'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true, secure: false },
        '/ws': { target: wsTarget, ws: true, changeOrigin: true },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('/node_modules/')) return undefined
            if (id.includes('/node_modules/three/')) return 'vendor-three'
            if (id.includes('/node_modules/@react-three/fiber/')) return 'vendor-r3f'
            if (id.includes('/node_modules/@react-three/drei/')) return 'vendor-drei'
            if (id.includes('/node_modules/gsap/')) return 'vendor-gsap'
            if (id.includes('/node_modules/lenis/')) return 'vendor-lenis'
            return undefined
          },
        },
      },
    },
  }
})

