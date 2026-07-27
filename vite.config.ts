import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production' || process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  const disableHmr = process.env.DISABLE_HMR === 'true' || isProduction;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'suppress-hmr-websocket-errors',
        transformIndexHtml(html) {
          if (disableHmr) {
            return html.replace(
              '</head>',
              `  <script>
    if (typeof window !== 'undefined') {
      const origWS = window.WebSocket;
      window.WebSocket = function(url, protocols) {
        if (typeof url === 'string' && (url.includes('vite') || url.includes('hmr') || url.includes(':3000'))) {
          try {
            return new origWS(url, protocols);
          } catch (e) {
            return {
              send: () => {},
              close: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
              readyState: 3
            };
          }
        }
        return new origWS(url, protocols);
      };
    }
  </script>\n</head>`
            );
          }
          return html;
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: disableHmr ? false : true,
      watch: disableHmr ? null : {},
    },
  };
});
