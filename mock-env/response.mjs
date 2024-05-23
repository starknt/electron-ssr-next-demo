import { OutgoingMessage } from 'node:http'
import { Buffer } from 'node:buffer'
import { PassThrough } from 'node:stream'

export class ServerResponse extends OutgoingMessage {
  statusCode = 200
  statusMessage = ''
  upgrading = false
  chunkedEncoding = false
  shouldKeepAlive = false
  useChunkedEncodingByDefault = false
  sendDate = false
  finished = false
  headersSent = false
  strictContentLength = false
  socket = null

  buffers = []

  req
  outcomingMessage = new PassThrough()

  constructor(req) {
    super()
    this.req = req
    // compat h3
    this.socket = req.socket
    this.sendDate = true
  }

  write(chunk, encoding, callback) {
    if (chunk)
      this.buffers.push(Buffer.from(chunk))
    // emit write event
    this.emit('write', chunk)
    if (typeof callback === 'undefined' && typeof encoding === 'function')
      return this.outcomingMessage.write(chunk, encoding)
    else if (typeof callback === 'function' && typeof encoding !== 'function')
      return this.outcomingMessage.write(chunk, encoding, callback)
    else
      return this.outcomingMessage.write(chunk)
  }

  end(chunk, encoding, callback) {
    if (chunk)
      this.buffers.push(Buffer.from(chunk))
    // emit end event
    this.emit('end', chunk)
    if (typeof chunk === 'function')
      this.outcomingMessage.end(chunk)
    else if (typeof callback === 'undefined' && typeof encoding === 'function')
      this.outcomingMessage.end(chunk, encoding)
    else if (typeof callback === 'function' && typeof encoding !== 'function')
      this.outcomingMessage.end(chunk, encoding, callback)
    else
      this.outcomingMessage.end(chunk)
    return this
  }

  writeContinue(_cb) {
    /** empty */
  }

  addTrailers(
    _headers,
  ) {
    /** empty */
  }

  writeEarlyHints(_headers, cb) {
    if (typeof cb === 'function')
      cb()
  }

  assignSocket(socket) {
    // @ts-expect-error private
    socket._httpMessage = this
    this.socket = socket
    this.emit('socket', socket)
    this._flush()
  }

  _flush() {
    this.flushHeaders()
  }

  _implicitHeader() {
    this.writeHead(this.statusCode)
    return false
  }

  writeHead(
    statusCode,
    arg1,
    arg2,
  ) {
    if (statusCode)
      this.statusCode = statusCode

    if (typeof arg1 === 'string') {
      this.statusMessage = arg1
      arg1 = undefined
    }
    const headers = arg2 || arg1
    if (headers) {
      let k
      if (Array.isArray(headers)) {
        if (headers.length % 2 !== 0)
          throw new Error('headers must be an even number of arguments')

        for (let n = 0; n < headers.length; n += 2) {
          k = headers[n + 0]
          this.removeHeader(k)
        }

        for (let n = 0; n < headers.length; n += 2) {
          k = headers[n + 0]
          if (k)
            this.appendHeader(k, headers[n + 1])
        }
      }
      else {
        const keys = Object.keys(headers)
        for (let i = 0; i < keys.length; i++) {
          k = keys[i]
          if (k)
            this.setHeader(k, headers[k])
        }
      }
    }
    this.headersSent = true
    return this
  }

  _finish() {
    this._finish()
  }
}
