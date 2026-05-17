import { untrack } from 'svelte'

type WatchRun<T> = (current: T, previous: T) => void | (() => void)
type WatchOptions<T> = { equals?: (a: T, b: T) => boolean }

function watchBody<T>(source: () => T, run: WatchRun<T>, options?: WatchOptions<T>) {
  const equals = options?.equals ?? Object.is
  let previous = untrack(source)
  return () => {
    const current = source()
    if (equals(current, previous)) return
    const prev = previous
    previous = current
    return untrack(() => run(current, prev))
  }
}

export function watch<T>(source: () => T, run: WatchRun<T>, options?: WatchOptions<T>): void {
  $effect(watchBody(source, run, options))
}

export function watchPre<T>(source: () => T, run: WatchRun<T>, options?: WatchOptions<T>): void {
  $effect.pre(watchBody(source, run, options))
}
