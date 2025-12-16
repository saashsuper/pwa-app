 
 
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    open: false, // Disable auto-open to prevent xdg-open error on headless servers
    host: true, // Allow external connections
  },
});




