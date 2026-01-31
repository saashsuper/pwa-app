 
 
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    open: false, // Disable auto-open to prevent xdg-open error on headless servers
    host: 'localhost', // Use localhost to avoid permission issues
    port: 5173,
    strictPort: true, // Fail if 5173 is in use instead of trying another port
  },
});




