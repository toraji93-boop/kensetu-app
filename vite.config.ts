import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import type { Plugin } from 'vite'

// 開発時: / へのアクセスを public/lp/index.html で返すプラグイン
// ビルド後: dist/index.html を app.html にリネームし、LP を index.html に配置
function lpPlugin(): Plugin {
  return {
    name: 'lp-plugin',
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
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const reactHtml = path.join(distDir, 'index.html')
      const appHtml = path.join(distDir, 'app.html')
      const lpHtml = path.join(distDir, 'lp', 'index.html')

      // Reactアプリの index.html → app.html にリネーム
      if (fs.existsSync(reactHtml)) {
        fs.renameSync(reactHtml, appHtml)
      }

      // LP の index.html をルートにコピー
      if (fs.existsSync(lpHtml)) {
        fs.copyFileSync(lpHtml, reactHtml)
      }
    },
  }
}

export default defineConfig({
  plugins: [lpPlugin(), react(), tailwindcss()],
})
