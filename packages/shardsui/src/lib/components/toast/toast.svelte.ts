import { contains, getTarget } from '$lib/internal/dom'
import { matchesFocusVisible } from '$lib/internal/floating/element'
import { generateId } from '$lib/internal/generate-id'
import { Timeout } from '$lib/internal/timeout'
import { untrack } from 'svelte'
import { ToastProviderContext } from './context'
import type {
  StoredToast,
  ToastManagerAddOptions,
  ToastManagerPromiseOptions,
  ToastManagerUpdateOptions,
  ToastObject
} from './types'

function applyLimited(toasts: StoredToast[], limit: number) {
  let activeIndex = 0
  toasts.forEach((toast) => {
    if (toast.transitionStatus === 'ending') {
      return
    }
    toast.limited = activeIndex >= limit
    activeIndex += 1
  })
}

type TimerInfo = {
  timer: Timeout
  start: number
  delay: number
  remaining: number
  callback: () => void
}

function toUpdateOptions<Data extends object>(
  options: string | ToastManagerUpdateOptions<Data>
): ToastManagerUpdateOptions<Data> {
  return typeof options === 'string' ? { description: options } : options
}

function resolvePromiseOptions<T, Data extends object>(
  options:
    | string
    | ToastManagerUpdateOptions<Data>
    | ((result: T) => string | ToastManagerUpdateOptions<Data>),
  result: T
): ToastManagerUpdateOptions<Data> {
  return toUpdateOptions(options instanceof Function ? options(result) : options)
}

type ToastProviderOptions = {
  timeout: number
  limit: number
}

type ToastUpdateFlags = {
  resetTimer?: boolean
  markUpdated?: boolean
}

export class ToastProvider {
  #options: () => ToastProviderOptions

  #timers = new Map<string, TimerInfo>()
  #areTimersPaused = false

  toasts = $state<StoredToast[]>([])
  hovering = $state(false)
  focused = $state(false)

  isWindowFocused = $state(true)
  viewport = $state<HTMLElement | null>(null)
  prevFocusElement = $state<HTMLElement | null>(null)

  timeout = $derived.by(() => this.#options().timeout)
  limit = $derived.by(() => this.#options().limit)

  expanded = $derived(this.hovering || this.focused)
  expandedOrOutOfFocus = $derived(this.hovering || this.focused || !this.isWindowFocused)
  isEmpty = $derived(this.toasts.length === 0)

  constructor(options: () => ToastProviderOptions) {
    this.#options = options

    $effect.pre(() => {
      const limit = this.limit
      untrack(() => applyLimited(this.toasts, limit))
    })

    $effect(() => () => this.#clearAllTimers())
  }

  #findToast(id: string): StoredToast | undefined {
    return this.toasts.find((toast) => toast.id === id)
  }

  #clearAllTimers(): void {
    this.#timers.forEach(({ timer }) => timer.clear())
    this.#timers.clear()
    this.#areTimersPaused = false
  }

  #forgetTimer(id: string): void {
    this.#timers.delete(id)
    if (this.#timers.size === 0) {
      this.#areTimersPaused = false
    }
  }

  #clearTimer(id: string): void {
    this.#timers.get(id)?.timer.clear()
    this.#forgetTimer(id)
  }

  #scheduleTimer(id: string, delay: number, callback: () => void): void {
    const start = Date.now()
    const shouldStartActive = !this.expandedOrOutOfFocus

    const timer = new Timeout()
    if (shouldStartActive) {
      timer.start(delay, () => {
        this.#forgetTimer(id)
        callback()
      })
    }

    this.#timers.set(id, {
      timer,
      start,
      delay,
      remaining: delay,
      callback
    })
  }

  restoreFocusToPrevElement = (): void => {
    this.prevFocusElement?.focus({ preventScroll: true })
  }

  #restoreFocusAfterClose(toastId: string | undefined): void {
    const activeEl = (this.viewport?.ownerDocument ?? document).activeElement
    if (!contains(this.viewport, activeEl) || !matchesFocusVisible(activeEl)) {
      return
    }

    if (toastId === undefined) {
      this.restoreFocusToPrevElement()
      return
    }

    const currentIndex = this.indexOf(toastId)

    const scan = (from: number, step: number) => {
      for (let index = from; index >= 0 && index < this.toasts.length; index += step) {
        if (this.toasts[index].transitionStatus !== 'ending') {
          return this.toasts[index]
        }
      }
      return null
    }

    const nextToast = scan(currentIndex + 1, 1) ?? scan(currentIndex - 1, -1)

    if (nextToast) {
      nextToast.element?.focus()
    } else {
      this.restoreFocusToPrevElement()
    }
  }

  indexOf = (id: string): number => {
    return this.toasts.findIndex((toast) => toast.id === id)
  }

  visibleIndexOf = (id: string): number => {
    let visibleIndex = 0
    for (const toast of this.toasts) {
      if (toast.id === id) {
        return toast.transitionStatus === 'ending' ? -1 : visibleIndex
      }
      if (toast.transitionStatus !== 'ending') visibleIndex++
    }
    return -1
  }

  stackIndexOf = (toast: ToastObject): number => {
    return toast.transitionStatus === 'ending'
      ? this.indexOf(toast.id)
      : this.visibleIndexOf(toast.id)
  }

  offsetYOf = (id: string): number => {
    let offsetY = 0
    for (const toast of this.toasts) {
      if (toast.id === id) return offsetY
      offsetY += toast.height || 0
    }
    return 0
  }

  #deleteToastAt(index: number): void {
    this.toasts.splice(index, 1)
    if (this.toasts.length === 0) {
      this.hovering = false
      this.focused = false
    }
  }

  remove = (toastId: string): void => {
    const index = this.indexOf(toastId)
    if (index === -1) return

    this.toasts[index].onRemove?.()
    this.#deleteToastAt(index)
  }

  applyUpdate = <Data extends object>(
    id: string,
    updates: Partial<Omit<ToastObject<Data>, 'id'>>,
    { resetTimer = false, markUpdated = false }: ToastUpdateFlags = {}
  ): void => {
    const toast = this.#findToast(id)
    if (!toast) return

    if (toast.transitionStatus === 'ending') return

    const wasLoading = toast.type === 'loading'

    Object.assign(toast, updates, markUpdated ? { updateKey: toast.updateKey + 1 } : null)

    const nextTimeout = toast.timeout ?? this.timeout
    const timeoutUpdated = Object.hasOwn(updates, 'timeout')

    const shouldHaveTimer = toast.type !== 'loading' && nextTimeout > 0
    const hasTimer = this.#timers.has(id)

    if (!shouldHaveTimer && hasTimer) {
      this.#clearTimer(id)
      return
    }

    if (shouldHaveTimer && (!hasTimer || timeoutUpdated || wasLoading || resetTimer)) {
      this.#clearTimer(id)
      this.#scheduleTimer(id, nextTimeout, () => this.close(id))

      if (this.expandedOrOutOfFocus) {
        this.pauseTimers()
      }
    }
  }

  pauseTimers = (): void => {
    if (this.#areTimersPaused) return
    this.#areTimersPaused = true
    this.#timers.forEach((entry) => {
      if (!entry.timer.isStarted()) return
      entry.timer.clear()
      entry.remaining = Math.max(entry.remaining - (Date.now() - entry.start), 0)
    })
  }

  resumeTimers = (): void => {
    if (!this.#areTimersPaused) return
    this.#areTimersPaused = false
    this.#timers.forEach((entry, id) => {
      entry.remaining = entry.remaining > 0 ? entry.remaining : entry.delay
      entry.timer.start(entry.remaining, () => {
        this.#forgetTimer(id)
        entry.callback()
      })
      entry.start = Date.now()
    })
  }

  close = (toastId?: string): void => {
    const closeAll = toastId === undefined
    let toastsToClose: StoredToast[]

    if (closeAll) {
      toastsToClose = this.toasts
      this.#clearAllTimers()
    } else {
      const toast = this.#findToast(toastId)
      if (!toast) return
      toastsToClose = [toast]
      this.#clearTimer(toastId)
    }

    const activeToastsToClose = toastsToClose.filter((toast) => toast.transitionStatus !== 'ending')

    toastsToClose.forEach((toast) => {
      toast.transitionStatus = 'ending'
      toast.height = 0
    })
    applyLimited(this.toasts, this.limit)

    const hasActiveToasts = this.toasts.some((toast) => toast.transitionStatus !== 'ending')
    if (!hasActiveToasts) {
      this.hovering = false
      this.focused = false
    }

    activeToastsToClose.forEach((toast) => {
      toast.onClose?.()
    })

    this.#restoreFocusAfterClose(toastId)
  }

  add = <Data extends object>(options: ToastManagerAddOptions<Data>): string => {
    const id = options.id || generateId('toast')

    if (options.id) {
      const existingIndex = this.indexOf(options.id)
      if (existingIndex !== -1) {
        const existing = this.toasts[existingIndex]
        if (existing.transitionStatus === 'ending') {
          this.#deleteToastAt(existingIndex)
        } else {
          const { id: _, transitionStatus: __, ...updates } = options
          this.applyUpdate(options.id, updates, { resetTimer: true, markUpdated: true })
          return options.id
        }
      }
    }

    const toastToAdd: StoredToast<Data> = {
      ...options,
      id,
      updateKey: 0,
      transitionStatus: 'starting'
    }

    this.toasts.unshift(toastToAdd)
    applyLimited(this.toasts, this.limit)

    const duration = toastToAdd.timeout ?? this.timeout
    if (toastToAdd.type !== 'loading' && duration > 0) {
      this.#scheduleTimer(id, duration, () => this.close(id))
    }

    if (this.expandedOrOutOfFocus) {
      this.pauseTimers()
    }

    return id
  }

  update = <Data extends object>(id: string, updates: ToastManagerUpdateOptions<Data>): void => {
    this.applyUpdate(id, updates, { markUpdated: true })
  }

  promise = <Value, Data extends object>(
    promiseValue: Promise<Value>,
    options: ToastManagerPromiseOptions<Value, Data> & {
      setPromise?: (promise: Promise<Value>) => void
    }
  ): Promise<Value> => {
    const loadingOptions = toUpdateOptions(options.loading)
    const id = this.add({
      ...loadingOptions,
      type: 'loading'
    })

    const handledPromise = promiseValue
      .then((result: Value) => {
        const successOptions = resolvePromiseOptions(options.success, result)
        this.update(id, {
          ...successOptions,
          type: 'success',
          timeout: successOptions.timeout
        })
        return result
      })
      .catch((error) => {
        const errorOptions = resolvePromiseOptions(options.error, error)
        this.update(id, {
          ...errorOptions,
          type: 'error',
          timeout: errorOptions.timeout
        })
        return Promise.reject(error)
      })

    options.setPromise?.(handledPromise)

    return handledPromise
  }

  collapseOnOutsideTouch = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') return
    const target = getTarget(event)
    if (contains(this.viewport, target)) return

    this.resumeTimers()
    this.hovering = false
    this.focused = false
  }
}

type ToastRootOptions = {
  toast: ToastObject
  ref: HTMLElement | null
}

export class ToastRoot {
  #options: () => ToastRootOptions
  #provider = ToastProviderContext.get()

  titleId = $state<string | undefined>(undefined)
  descriptionId = $state<string | undefined>(undefined)
  #labelIds: { titleId?: string; descriptionId?: string } = {}

  toast = $derived.by(() => this.#options().toast)

  constructor(options: () => ToastRootOptions) {
    this.#options = options

    $effect(this.recalculateHeight)
  }

  registerLabelId(part: 'title' | 'description', id: string): () => void {
    const field = part === 'title' ? 'titleId' : 'descriptionId'

    this.#labelIds[field] = id
    this[field] = id

    return () => {
      if (this.#labelIds[field] !== id) return
      this.#labelIds[field] = undefined
      this[field] = undefined
    }
  }

  recalculateHeight = (): void => {
    const element = this.#options().ref
    if (!element) return

    const previousHeight = element.style.height
    element.style.height = 'auto'
    const height = element.offsetHeight
    element.style.height = previousHeight

    const toast = this.toast
    untrack(() => {
      this.#provider.applyUpdate(toast.id, {
        element,
        height,
        transitionStatus: undefined
      })
    })
  }
}
