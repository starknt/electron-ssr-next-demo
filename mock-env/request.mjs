import { Readable } from 'node:stream'
import { Socket } from './socket.mjs'

export class IncomingMessage extends Readable {
  aborted = false
  httpVersion = '1.1'
  httpVersionMajor = 1
  httpVersionMinor = 1
  complete = true
  connection
  socket
  headers = {}
  trailers = {}
  method = 'GET'
  url = '/'
  statusCode = 200
  statusMessage = ''
  closed = false
  errored = null

  readable = false

  constructor(socket) {
    super()
    this.socket = this.connection = socket || new Socket()
  }

  get rawHeaders() {
    return rawHeaders(this.headers)
  }

  get rawTrailers() {
    return []
  }

  setTimeout(_msecs, _callback) {
    return this
  }

  get headersDistinct() {
    return _distinct(this.headers)
  }

  get trailersDistinct() {
    return _distinct(this.trailers)
  }
}

function _distinct(obj) {
  const d = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key) {
      d[key] = (Array.isArray(value) ? value : [value]).filter(
        Boolean,
      )
    }
  }
  return d
}

export function rawHeaders(headers) {
  const rawHeaders = []
  for (const key in headers) {
    if (Array.isArray(headers[key])) {
      for (const h of headers[key])
        rawHeaders.push(key, h)
    }
    else {
      rawHeaders.push(key, headers[key])
    }
  }
  return rawHeaders
}
