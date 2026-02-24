import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes, req, res) => {
              const setCookie = proxyRes.headers['set-cookie'];
              if (setCookie) {
                const list = Array.isArray(setCookie) ? setCookie : [setCookie];
                proxyRes.headers['set-cookie'] = list.map((cookie) =>
                  cookie
                    .replace(/;\s*Secure/gi, '')
                    .replace(/;\s*Domain=[^;]+/gi, '')
                );
              }
            });
          },
        },
      },
    },
  };
})
