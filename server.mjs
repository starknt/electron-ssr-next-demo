import next from 'next'
import { BrowserWindow, app, protocol } from 'electron'
import { IncomingMessage } from './mock-env/request.mjs'
import { ServerResponse } from './mock-env/response.mjs'
import { URL, fileURLToPath, parse } from 'node:url'
import { dirname, extname, join } from 'node:path'
import { createReadStream } from 'node:fs'

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'next',
    privileges: {
      standard: true,
      stream: true,
      supportFetchAPI: true,
      secure: true,
      bypassCSP: true
    }
  }
])

const nextApp = next({
  dev: false,
  hostname: 'starknt',
})

const handler = nextApp.getRequestHandler()

await nextApp.prepare()

const mimeMap = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/x-font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/x-font-opentype',
  '.wasm': 'application/wasm',
}

class ProtocolServer {
  constructor(handler) {
    this.handler = handler
  }

  async handle(request) {
    const uri = new URL(request.url)
    const host = uri.host
    const scheme = uri.protocol.replace(/:$/, '')
    const url = request.url
      .replace(`${scheme}://${host}`, '')
      .replace(/\/$/, '')
    const parsedUrl = parse(request.url, true)
    const req = new IncomingMessage()
    const res = new ServerResponse(req)

    const { pathname, query } = parsedUrl
    if(Object.keys(mimeMap).some(ext => pathname.endsWith(ext))) {
      const __dirname = dirname(fileURLToPath(import.meta.url))
      
      if(request.url.includes('static')) {
        const filepath = join(__dirname, '.next', pathname.replace('_next', ''))
        const ext = extname(filepath)
        return new Response(createReadStream(filepath), {
          headers: {
            'Content-Type': mimeMap[ext] ?? 'text/plain'
          }
        })
      } else {
        const filepath = join(__dirname, 'public', pathname)
        const ext = extname(filepath)
        return new Response(createReadStream(filepath), {
          headers: {
            'Content-Type': mimeMap[ext] ?? 'text/plain'
          }
        })
      }
    }

    if(pathname === '/') {
      await nextApp.render(req, res, '/', query)
    } else {
      await this.handler(req, res, parsedUrl)
    }

    return new Response(Buffer.concat(res.buffers), {
      status: res.statusCode,
      headers: formatOutgoingHttpHeaders(res.getHeaders()),
      statusText: res.statusMessage,
    })
  }
}

let win
app.on('ready', () => {
  const server = new ProtocolServer(handler)
  protocol.handle('next', (request) => server.handle(request))

  win = new BrowserWindow()
  win.webContents.openDevTools({
    mode: 'detach'
  })
  win.loadURL('next://starknt.com')
})

function formatOutgoingHttpHeaders(headers) {
  const out = {}
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      const v = value.join(', ')
      out[key] = v
    }
    else {
      out[key] = String(value)
    }
  }
  return out
}
