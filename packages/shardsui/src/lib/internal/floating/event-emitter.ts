// `EventEmitter`'s private `#listeners` makes the class invariant in `Events`, so a
// `FloatingTree<MenuTreeEvents>` would not assign to `FloatingTree<FloatingTreeEvents>`.
// Annotating the field with this structural alias erases the private field and restores it.
export type Emitter<Events> = {
  emit<K extends keyof Events>(event: K, data: Events[K]): void
  on<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): () => void
  off<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): void
}

export class EventEmitter<Events> implements Emitter<Events> {
  #listeners: { [K in keyof Events]?: Set<(data: Events[K]) => void> } = {}

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    this.#listeners[event]?.forEach((listener) => listener(data))
  }

  on<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): () => void {
    let listeners = this.#listeners[event]
    if (!listeners) {
      listeners = new Set()
      this.#listeners[event] = listeners
    }
    listeners.add(listener)
    return () => this.off(event, listener)
  }

  off<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): void {
    this.#listeners[event]?.delete(listener)
  }
}
