import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'

import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.js',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        match: ['https://b.soyoung.com/wb/*'],
      },
      build: {
        externalGlobals: {
          axios: "Axios",
          jquery: "$",
        },
      },
    }),
  ],
});
