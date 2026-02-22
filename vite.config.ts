import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { WebSocketServer, WebSocket as NodeWebSocket } from 'ws'
import type { IncomingMessage } from 'node:http'
import type { Duplex } from 'node:stream'

const CONFIG_DIR = path.join(os.homedir(), '.config', 'bot-dashboard')
const CONFIG_FILE = path.join(CONFIG_DIR, 'bots.json')

function botConfigApi(): Plugin {
  return {
    name: 'bot-config-api',
    configureServer(server) {
      server.middlewares.use('/api/bots', (req, res) => {
        if (req.method === 'GET') {
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

/**
 * WebSocket proxy — routes browser WS through Vite to avoid Chrome
 * Private Network Access restrictions (localhost → private IP blocked).
 *
 * Browser connects to: ws://localhost:PORT/ws-proxy?url=<encoded-bot-url>
 * Vite proxies to:     ws://192.168.x.x:PORT (the actual bot)
 */
function wsProxyPlugin(): Plugin {
  return {
    name: 'ws-proxy',
    configureServer(server) {
      const wss = new WebSocketServer({ noServer: true })

      server.httpServer?.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        const reqUrl = new URL(req.url || '', `http://${req.headers.host}`)
        if (reqUrl.pathname !== '/ws-proxy') return // let Vite HMR and others pass through

        const targetUrl = reqUrl.searchParams.get('url')
        if (!targetUrl) {
          socket.destroy()
          return
        }

        // Accept the browser's WebSocket via ws library
        wss.handleUpgrade(req, socket, head, (browserWs) => {
          // Connect to the actual bot
          const botWs = new NodeWebSocket(targetUrl)

          botWs.on('open', () => {
            // Relay: bot → browser
            botWs.on('message', (data, isBinary) => {
              if (browserWs.readyState === NodeWebSocket.OPEN) {
                browserWs.send(data, { binary: isBinary })
              }
            })

            // Relay: browser → bot
            browserWs.on('message', (data, isBinary) => {
              if (botWs.readyState === NodeWebSocket.OPEN) {
                botWs.send(data, { binary: isBinary })
              }
            })
          })

          botWs.on('close', () => {
            if (browserWs.readyState === NodeWebSocket.OPEN) browserWs.close()
          })
          botWs.on('error', () => {
            if (browserWs.readyState === NodeWebSocket.OPEN) browserWs.close()
          })

          browserWs.on('close', () => {
            if (botWs.readyState === NodeWebSocket.OPEN) botWs.close()
          })
          browserWs.on('error', () => {
            if (botWs.readyState === NodeWebSocket.OPEN) botWs.close()
          })
        })
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), botConfigApi(), wsProxyPlugin()],
})
