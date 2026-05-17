type TimeoutId = ReturnType<typeof setTimeout>

export class Timeout {
  #currentId: TimeoutId | undefined

  start(delay: number, fn: () => void): void {
    this.clear()
    this.#currentId = setTimeout(() => {
      this.#currentId = undefined
      fn()
    }, delay)
  }

  isStarted(): boolean {
    return this.#currentId !== undefined
  }

  clear = (): void => {
    if (this.#currentId !== undefined) {
      clearTimeout(this.#currentId)
      this.#currentId = undefined
    }
  }

  disposeEffect = (): (() => void) => this.clear
}
