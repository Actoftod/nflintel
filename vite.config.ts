
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Set base to relative for flexible deployment on Hostinger shared hosting
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  server: {
    port: 3000,
    host: true
  },
  define: {
    // Ensure API Key is injected during build time from the deployment environment
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
