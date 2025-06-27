import {defineConfig} from 'vite';
import { DiscordProxy } from '@robojs/patch'


export default defineConfig({
  envDir: '../',
  server: {
    proxy: {
      '/.proxy/assets': {
        target: 'http://localhost:5173/assets',
        changeOrigin: true,
        ws: true,
        rewrite: path => path.replace(/^\/.proxy\/assets/, ''),
      },
      '/.proxy/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: path => path.replace(/^\/\.proxy/, ''),
      },
    },
    allowedHosts: true
  },
  plugins: [DiscordProxy.Vite()]
});

// https://vitejs.dev/config/


// export default defineConfig({
//   envDir: '../',
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:3001',
//         changeOrigin: true,
//         secure: false,
//         ws: true,
//       },
//     },
//     // hmr: {
//     //   clientPort: 443,
//     // },
//     allowedHosts: true
//   },
// });
// import { defineConfig } from 'vite';