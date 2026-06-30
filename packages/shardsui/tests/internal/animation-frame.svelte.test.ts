import { AnimationFrame } from '$lib/internal/animation-frame.svelte'
import { flushSync } from 'svelte'
import { expect, it, vi } from 'vitest'

describe('AnimationFrame#disposeEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('cancels a pending frame when the owning effect root is destroyed', () => {
    const spy = vi.fn()

    const cleanup = $effect.root(() => {
      const frame = new AnimationFrame()
      $effect(frame.disposeEffect)
      flushSync()
      frame.request(spy)
    })

    cleanup()
    vi.advanceTimersToNextFrame()
    vi.advanceTimersToNextFrame()

    expect(spy).not.toHaveBeenCalled()
  })
})
