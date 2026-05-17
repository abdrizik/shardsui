import { getContext, setContext } from 'svelte'

export class Context<T> {
  readonly #key: symbol
  readonly #fallback?: T

  constructor(name: string, fallback?: T) {
    this.#key = Symbol(name)
    this.#fallback = fallback
  }

  get(): T {
    const context = this.getOr()
    if (context !== undefined) return context
    if (this.#fallback !== undefined) return this.#fallback
    throw new Error(`ShardsUI: this part must be rendered inside <${this.#key.description}>.`)
  }

  getOr(): T | undefined {
    return getContext<T | undefined>(this.#key)
  }

  set(context: T | undefined): void {
    setContext(this.#key, context)
  }
}
