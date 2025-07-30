function spread(handler, evt) {
  return handler(evt.detail);
}

export class EventEmitter extends EventTarget {
  constructor() {
    super();
  }

  on(eventName, handler) {
    this.addEventListener(eventName, spread.bind(null, handler));
  }

  off(eventName, handler) {
    this.removeEventListener(eventName, spread.bind(null, handler));
  }

  once(eventName, handler) {
    this.addEventListener(eventName, spread.bind(null, handler), { once: true });
  }

  removeListener(eventName, handler) {
    this.removeEventListener(eventName, spread.bind(null, handler));
  }

  emit<T>(eventName, detail?) {
    this.dispatchEvent(new CustomEvent<T>(eventName, { detail }));
  }
}
