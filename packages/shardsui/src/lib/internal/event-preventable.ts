/** Mixed into the event a part passes to your handler when the part runs its own logic after yours. */
export type PreventableEvent = {
  preventShardsUIHandler(): void
}

type TrackedPreventableEvent = PreventableEvent & {
  shardsUIHandlerPrevented?: boolean
}

export function makeEventPreventable<E extends Event>(event: E): E & TrackedPreventableEvent {
  const preventable = event as E & TrackedPreventableEvent
  preventable.preventShardsUIHandler ??= () => {
    preventable.shardsUIHandlerPrevented = true
  }

  return preventable
}
