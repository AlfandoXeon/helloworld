/**
 * EventEmitter - Pub/Sub Event Bus for Clean MVC Decoupling
 * Implements Observer Pattern for reactive communication across Models, Views, and Controllers.
 */
export class EventEmitter {
  constructor() {
    this._events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event 
   * @param {Function} listener 
   * @returns {Function} Unsubscribe callback
   */
  on(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    if (!this._events.has(event)) {
      this._events.set(event, new Set());
    }

    this._events.get(event).add(listener);

    return () => this.off(event, listener);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event 
   * @param {Function} listener 
   */
  off(event, listener) {
    if (!this._events.has(event)) return;
    this._events.get(event).delete(listener);
    if (this._events.get(event).size === 0) {
      this._events.delete(event);
    }
  }

  /**
   * Subscribe to an event for a single invocation
   * @param {string} event 
   * @param {Function} listener 
   */
  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener.apply(this, args);
    };
    this.on(event, wrapper);
  }

  /**
   * Emit an event to all subscribers
   * @param {string} event 
   * @param  {...any} args 
   */
  emit(event, ...args) {
    if (!this._events.has(event)) return;
    this._events.get(event).forEach((listener) => {
      try {
        listener(...args);
      } catch (err) {
        console.error(`Error in event listener for "${event}":`, err);
      }
    });
  }

  /**
   * Remove all listeners for an event or all events
   * @param {string} [event] 
   */
  clear(event) {
    if (event) {
      this._events.delete(event);
    } else {
      this._events.clear();
    }
  }
}
