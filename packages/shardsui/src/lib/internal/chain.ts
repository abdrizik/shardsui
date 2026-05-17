import { makeEventPreventable } from './event-preventable'

type Handler<E extends Event> = (event: E) => void

export function chain<E extends Event>(
  ...handlers: (Handler<E> | null | undefined)[]
): (event: E) => void {
  return (event) => {
    const preventable = makeEventPreventable(event)
    for (const handler of handlers) {
      handler?.(preventable)
      if (preventable.shardsUIHandlerPrevented) return
    }
  }
}
