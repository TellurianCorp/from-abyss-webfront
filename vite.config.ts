import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determina o target da API baseado no ambiente
  // No Docker, usa o nome do serviço; localmente usa localhost
  const apiTarget = env.VITE_API_BASE_URL || 
                    (process.env.DOCKER_ENV ? 'http://api:8080' : 'http://localhost:8080')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        // Proxy para /v1 (endpoints da API)
        '/v1': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path, // Mantém o path original
        },
        // Proxy para /api (compatibilidade, se necessário)
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        // Proxy para endpoints ActivityPub (desenvolvimento local)
        // Em produção, isso é feito pelo nginx
        '/.well-known/webfinger': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/.well-known/nodeinfo': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/nodeinfo': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/actors': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/inbox': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      // Ensure proper HTML minification and optimization
      minify: 'esbuild',
      // Generate source maps for better debugging (disable in production if needed)
      sourcemap: false,
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      // Enable code splitting and tree shaking
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
            'bootstrap-vendor': ['bootstrap', 'react-bootstrap'],
          },
          // Optimize chunk file names for better caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize asset inlining threshold (smaller files inline, larger ones separate)
      assetsInlineLimit: 4096,
      // Enable terser for better minification (if needed, but esbuild is faster)
      // minify: 'terser', // Uncomment if you need more aggressive minification
    },
    // Ensure proper handling of static assets
    publicDir: 'public',
  }
})
