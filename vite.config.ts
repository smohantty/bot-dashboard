import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const CONFIG_DIR = path.join(os.homedir(), '.config', 'bot-dashboard')
const CONFIG_FILE = path.join(CONFIG_DIR, 'bots.json')

function botConfigApi(): Plugin {
  return {
    name: 'bot-config-api',
    configureServer(server) {
      server.middlewares.use('/api/bots', (req, res) => {
        if (req.method === 'GET') {
          // Ensure config dir and file exist
          if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true })
          }
          if (!fs.existsSync(CONFIG_FILE)) {
            fs.writeFileSync(CONFIG_FILE, JSON.stringify({ connections: [] }, null, 2))
          }
          const data = fs.readFileSync(CONFIG_FILE, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        } else if (req.method === 'PUT') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', () => {
            if (!fs.existsSync(CONFIG_DIR)) {
              fs.mkdirSync(CONFIG_DIR, { recursive: true })
            }
            fs.writeFileSync(CONFIG_FILE, body)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          })
        } else {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), botConfigApi()],
})
