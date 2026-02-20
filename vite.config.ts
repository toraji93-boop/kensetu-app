import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

// / へのアクセスを public/lp/index.html で返すプラグイン
function lpRedirectPlugin(): Plugin {
  return {
    name: 'lp-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          const lpPath = path.resolve(__dirname, 'public/lp/index.html')
          const html = fs.readFileSync(lpPath, 'utf-8')
          res.setHeader('Content-Type', 'text/html')
          res.end(html)
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [lpRedirectPlugin(), react(), tailwindcss()],
})
