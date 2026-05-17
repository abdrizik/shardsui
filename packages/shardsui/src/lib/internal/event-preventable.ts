type PreventableEvent = Event & {
  preventShardsUIHandler(): void
  shardsUIHandlerPrevented?: boolean
}

export function makeEventPreventable<E extends Event>(event: E): E & PreventableEvent {
  const preventable = event as E & PreventableEvent
  preventable.preventShardsUIHandler ??= () => {
    preventable.shardsUIHandlerPrevented = true
  }

  return preventable
}
