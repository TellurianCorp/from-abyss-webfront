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
      },
    },
    build: {
      // Ensure proper HTML minification and optimization
      minify: 'esbuild',
      // Generate source maps for better debugging (disable in production if needed)
      sourcemap: false,
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
    },
    // Ensure proper handling of static assets
    publicDir: 'public',
  }
})
