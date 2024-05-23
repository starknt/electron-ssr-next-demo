import { Readable, Writable } from 'node:stream'

export function mergeFns(...functions) {
  return function (...args) {
    for (const fn of functions)
      fn(...args)
  }
}

// Docs: https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams
// Implementation: https://github.com/nodejs/node/blob/master/lib/internal/streams/duplex.js


const __Duplex = class {
  allowHalfOpen = true
  _destroy

  constructor(readable = new Readable(), writable = new Writable()) {
    Object.assign(this, readable)
    Object.assign(this, writable)
    this._destroy = mergeFns(readable._destroy, writable._destroy)
  }
}

function getDuplex() {
  Object.assign(__Duplex.prototype, Readable.prototype)
  Object.assign(__Duplex.prototype, Writable.prototype)
  return __Duplex
}

export const _Duplex = /* #__PURE__ */ getDuplex()

export const Duplex
  = (globalThis).Duplex || _Duplex
