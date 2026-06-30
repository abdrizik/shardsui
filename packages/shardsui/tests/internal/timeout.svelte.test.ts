import { Timeout } from '$lib/internal/timeout'
import { flushSync } from 'svelte'
import { expect, it, vi } from 'vitest'

describe('Timeout#disposeEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears a pending timeout when the owning effect root is destroyed', () => {
    const spy = vi.fn()

    const cleanup = $effect.root(() => {
      const timeout = new Timeout()
      $effect(timeout.disposeEffect)
      flushSync()
      timeout.start(100, spy)
    })

    cleanup()
    vi.advanceTimersByTime(500)

    expect(spy).not.toHaveBeenCalled()
  })
})
