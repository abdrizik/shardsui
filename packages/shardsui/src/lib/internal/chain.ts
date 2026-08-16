import { makeEventPreventable, type PreventableEvent } from './event-preventable'

type Handler<E extends Event> = { handle(event: E): void }['handle']

export function chain<E extends Event>(
  ...handlers: (Handler<E & PreventableEvent> | null | undefined)[]
): Handler<E> | undefined {
  if (!handlers.some(Boolean)) return undefined

  return (event) => {
    const preventable = makeEventPreventable(event)
    for (const handler of handlers) {
      handler?.(preventable)
      if (preventable.shardsUIHandlerPrevented) return
    }
  }
}
