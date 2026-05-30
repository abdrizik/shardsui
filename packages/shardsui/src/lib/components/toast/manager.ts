import { generateId } from '$lib/internal/generate-id'
import { ToastProviderContext } from './context'
import type {
  ToastManagerAddOptions,
  ToastManagerPromiseOptions,
  ToastManagerUpdateOptions,
  ToastObject
} from './types'

type ToastPromiseEventOptions = ToastManagerPromiseOptions<unknown> & {
  promise: Promise<unknown>
  setPromise: (promise: Promise<unknown>) => void
}

type ToastManagerEvent =
  | { action: 'add'; options: ToastObject }
  | { action: 'close'; options: { id?: string } }
  | { action: 'update'; options: ToastManagerUpdateOptions & { id: string } }
  | { action: 'promise'; options: ToastPromiseEventOptions }

export function getToastManager<Data extends object = object>() {
  const provider = ToastProviderContext.get()
  return {
    get toasts() {
      return provider.toasts as ToastObject<Data>[]
    },
    add: <T extends Data = Data>(options: ToastManagerAddOptions<T>): string =>
      provider.add(options),
    close: provider.close,
    update: <T extends Data = Data>(id: string, updates: ToastManagerUpdateOptions<T>): void =>
      provider.update(id, updates),
    promise: <Value, T extends Data = Data>(
      promiseValue: Promise<Value>,
      options: ToastManagerPromiseOptions<Value, T>
    ): Promise<Value> => provider.promise(promiseValue, options)
  }
}

/** A detached toast queue a `Toast.Provider` subscribes to. */
export class ToastManager<Data extends object = object> {
  #listeners = new Set<(data: ToastManagerEvent) => void>()

  #emit(data: ToastManagerEvent) {
    this.#listeners.forEach((listener) => listener(data))
  }

  subscribe(listener: (data: ToastManagerEvent) => void) {
    this.#listeners.add(listener)
    return () => {
      this.#listeners.delete(listener)
    }
  }

  add<T extends Data = Data>(options: ToastManagerAddOptions<T>): string {
    const id = options.id || generateId('toast')
    const toastToAdd: ToastObject<T> = { ...options, id, transitionStatus: 'starting' }
    this.#emit({ action: 'add', options: toastToAdd })
    return id
  }

  close(id?: string) {
    this.#emit({ action: 'close', options: { id } })
  }

  update<T extends Data = Data>(id: string, updates: ToastManagerUpdateOptions<T>) {
    this.#emit({ action: 'update', options: { ...updates, id } })
  }

  promise<Value, T extends Data = Data>(
    promiseValue: Promise<Value>,
    options: ToastManagerPromiseOptions<Value, T>
  ): Promise<Value> {
    let handledPromise = promiseValue
    this.#emit({
      action: 'promise',
      options: {
        ...options,
        promise: promiseValue,
        setPromise(promise: Promise<Value>) {
          handledPromise = promise
        }
      } as ToastPromiseEventOptions
    })
    return handledPromise
  }
}
