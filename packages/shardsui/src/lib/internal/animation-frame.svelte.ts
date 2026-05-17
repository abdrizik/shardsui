import { DEV } from 'esm-env'

type AnimationFrameId = number

let lastRAF = globalThis.requestAnimationFrame

class Scheduler {
  callbacks: (FrameRequestCallback | null)[] = []

  nextId = 1

  startId = 1

  isScheduled = false

  tick = (timestamp: number) => {
    this.isScheduled = false

    const currentCallbacks = this.callbacks
    this.callbacks = []
    this.startId = this.nextId

    for (const callback of currentCallbacks) {
      callback?.(timestamp)
    }
  }

  request(fn: FrameRequestCallback): AnimationFrameId {
    const id = this.nextId
    this.nextId += 1
    this.callbacks.push(fn)

    // Test suites swap `requestAnimationFrame` for a fake; a frame already scheduled on the old
    // one will never fire, so schedule again whenever the global identity changes.
    let rafChanged = false
    if (DEV && lastRAF !== requestAnimationFrame) {
      lastRAF = requestAnimationFrame
      rafChanged = true
    }

    if (!this.isScheduled || rafChanged) {
      this.isScheduled = true
      requestAnimationFrame(this.tick)
    }
    return id
  }

  cancel(id: AnimationFrameId): void {
    const index = id - this.startId
    if (index < 0 || index >= this.callbacks.length) {
      return
    }
    this.callbacks[index] = null
  }
}

const scheduler = new Scheduler()

export function requestAnimationFrameTick(fn: FrameRequestCallback): AnimationFrameId {
  return scheduler.request(fn)
}

export function cancelAnimationFrameTick(id: AnimationFrameId): void {
  scheduler.cancel(id)
}

export class AnimationFrame {
  #currentId: AnimationFrameId | null = null

  request(fn: () => void): void {
    this.cancel()
    this.#currentId = scheduler.request(() => {
      this.#currentId = null
      fn()
    })
  }

  cancel = (): void => {
    if (this.#currentId !== null) {
      scheduler.cancel(this.#currentId)
      this.#currentId = null
    }
  }

  disposeEffect = (): (() => void) => this.cancel
}
