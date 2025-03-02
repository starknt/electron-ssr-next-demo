import { Duplex } from './duplex.mjs'

// Docs: https://nodejs.org/api/net.html#net_class_net_socket
export class Socket extends Duplex {
  bufferSize = 0
  bytesRead = 0
  bytesWritten = 0
  connecting = false
  destroyed = false
  pending = false
  localAddress = ''
  localPort = 0
  remoteAddress = ''
  remoteFamily = ''
  remotePort = 0
  autoSelectFamilyAttemptedAddresses = []
  readyState = 'opening'

  constructor(_options) {
    super()
  }

  write(
    _buffer,
    _arg1,
    _arg2,
  ) {
    return false
  }

  connect(
    _arg1,
    _arg2,
    _arg3,
  ) {
    return this
  }

  end(
    _arg1,
    _arg2,
    _arg3,
  ) {
    // @ts-expect-error ignore
    return super.end(_arg1, _arg2, _arg3)
  }

  setEncoding(_encoding) {
    return this
  }

  pause() {
    return this
  }

  resume() {
    return this
  }

  setTimeout(_timeout, _callback) {
    return this
  }

  setNoDelay(_noDelay) {
    return this
  }

  setKeepAlive(_enable, _initialDelay) {
    return this
  }

  address() {
    return {}
  }

  unref() {
    return this
  }

  ref() {
    return this
  }

  destroySoon() {
    this.destroy()
  }

  resetAndDestroy() {
    const err = new Error('ERR_SOCKET_CLOSED');
    (err).code = 'ERR_SOCKET_CLOSED'
    this.destroy(err)
    return this
  }
}

export class SocketAddress {
  address
  family
  port
  flowlabel
  constructor(options) {
    this.address = options.address
    this.family = options.family
    this.port = options.port
    this.flowlabel = options.flowlabel
  }
}
