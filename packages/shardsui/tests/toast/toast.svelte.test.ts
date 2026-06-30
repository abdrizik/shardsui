import { ToastProvider } from '$lib/components/toast/toast.svelte'
import { flushSync } from 'svelte'
import { expect, it, vi } from 'vitest'

const DEFAULT_TIMEOUT = 5000

function withProvider(
  run: (provider: ToastProvider) => void,
  config: { timeout?: number; limit?: number } = {}
) {
  const cleanup = $effect.root(() => {
    const provider = new ToastProvider(() => ({
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      limit: config.limit ?? 3
    }))
    flushSync()
    run(provider)
  })

  cleanup()
}

function statusOf(provider: ToastProvider, id: string) {
  return provider.toasts.find((toast) => toast.id === id)?.transitionStatus
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reapplies the limit when it changes', () => {
    const cleanup = $effect.root(() => {
      let limit = $state(1)
      const provider = new ToastProvider(() => ({ timeout: DEFAULT_TIMEOUT, limit }))
      flushSync()

      provider.add({ id: 'a' })
      provider.add({ id: 'b' })
      expect(provider.toasts.map((toast) => toast.limited)).toEqual([false, true])

      limit = 2
      flushSync()

      expect(provider.toasts.map((toast) => toast.limited)).toEqual([false, false])
    })

    cleanup()
  })

  it('keeps toast metadata synchronized after mutations', () => {
    withProvider((provider) => {
      provider.add({ id: 'a' })
      provider.add({ id: 'b' })
      provider.add({ id: 'c' })

      const metadata = () =>
        provider.toasts.map((toast) => [
          toast.id,
          provider.indexOf(toast.id),
          provider.visibleIndexOf(toast.id),
          provider.offsetYOf(toast.id)
        ])

      expect(metadata()).toEqual([
        ['c', 0, 0, 0],
        ['b', 1, 1, 0],
        ['a', 2, 2, 0]
      ])

      provider.applyUpdate('c', { height: 10 })
      provider.applyUpdate('b', { height: 20 })

      expect(metadata()).toEqual([
        ['c', 0, 0, 0],
        ['b', 1, 1, 10],
        ['a', 2, 2, 30]
      ])

      provider.close('b')

      expect(metadata()).toEqual([
        ['c', 0, 0, 0],
        ['b', 1, -1, 10],
        ['a', 2, 1, 10]
      ])

      provider.remove('b')

      expect(metadata()).toEqual([
        ['c', 0, 0, 0],
        ['a', 1, 1, 10]
      ])

      provider.add({ id: 'd' })

      expect(metadata()).toEqual([
        ['d', 0, 0, 0],
        ['c', 1, 1, 0],
        ['a', 2, 2, 10]
      ])

      expect(provider.indexOf('missing')).toBe(-1)
      expect(provider.visibleIndexOf('missing')).toBe(-1)
      expect(provider.offsetYOf('missing')).toBe(0)
    })
  })

  it('ignores height recalculations while a toast is transitioning out', () => {
    withProvider((provider) => {
      provider.add({ id: 'a' })
      provider.applyUpdate('a', { height: 40 })
      provider.close('a')

      expect(statusOf(provider, 'a')).toBe('ending')

      provider.applyUpdate('a', { height: 80, transitionStatus: undefined })

      expect(statusOf(provider, 'a')).toBe('ending')
      expect(provider.toasts[0].height).toBe(0)

      provider.remove('a')

      expect(provider.toasts).toEqual([])
    })
  })

  it('ignores mutations that target an unknown toast', () => {
    withProvider((provider) => {
      provider.add({ id: 'a' })

      provider.remove('missing')
      provider.close('missing')
      provider.applyUpdate('missing', { title: 'nope' })

      expect(provider.toasts.map((toast) => toast.id)).toEqual(['a'])
      expect(provider.toasts[0].title).toBeUndefined()
      expect(statusOf(provider, 'a')).not.toBe('ending')
    })
  })

  it('does not invoke onRemove for a toast that is no longer in the provider', () => {
    const onRemove = vi.fn()

    withProvider((provider) => {
      provider.add({ id: 'a', onRemove })

      provider.remove('a')
      expect(onRemove).toHaveBeenCalledTimes(1)

      provider.remove('a')
      expect(onRemove).toHaveBeenCalledTimes(1)
    })
  })

  describe('timer pausing', () => {
    it('re-pauses timers after the last toast is closed and a new one is added', () => {
      withProvider((provider) => {
        provider.add({ title: 'a', timeout: 100 })
        provider.pauseTimers()

        provider.close(provider.toasts[0].id)

        provider.add({ title: 'b', timeout: 100 })
        const newToastId = provider.toasts[0].id

        provider.pauseTimers()
        vi.advanceTimersByTime(200)

        expect(statusOf(provider, newToastId)).not.toBe('ending')
      })
    })

    it('re-pauses timers after all toasts are closed and a new one is added', () => {
      withProvider((provider) => {
        provider.add({ id: 'a', title: 'a', timeout: 100 })
        provider.add({ id: 'b', title: 'b', timeout: 100 })
        provider.pauseTimers()

        provider.close()

        provider.add({ id: 'c', title: 'c', timeout: 100 })
        provider.pauseTimers()
        vi.advanceTimersByTime(200)

        expect(statusOf(provider, 'c')).not.toBe('ending')
      })
    })

    it('re-pauses timers after the last active toast closes while ending toasts remain', () => {
      withProvider((provider) => {
        provider.add({ id: 'a', title: 'a', timeout: 100 })
        provider.add({ id: 'b', title: 'b', timeout: 100 })
        provider.pauseTimers()

        provider.close('b')
        provider.close('a')

        provider.add({ id: 'c', title: 'c', timeout: 100 })
        provider.pauseTimers()
        vi.advanceTimersByTime(200)

        expect(statusOf(provider, 'c')).not.toBe('ending')
      })
    })

    it('re-pauses timers after the last timed toast closes while untimed toasts remain', () => {
      withProvider((provider) => {
        provider.add({ id: 'loading', title: 'loading', type: 'loading' })
        provider.add({ id: 'timed', title: 'timed', timeout: 100 })
        provider.pauseTimers()

        provider.close('timed')

        provider.add({ id: 'c', title: 'c', timeout: 100 })
        provider.pauseTimers()
        vi.advanceTimersByTime(200)

        expect(statusOf(provider, 'c')).not.toBe('ending')
      })
    })

    it('keeps a rescheduled timer paused while expanded, and runs it once collapsed', () => {
      vi.useFakeTimers()
      withProvider((provider) => {
        provider.add({ id: 'a', title: 'a', timeout: 100 })

        provider.hovering = true
        provider.pauseTimers()

        provider.update('a', { timeout: 100 })

        vi.advanceTimersByTime(200)
        expect(statusOf(provider, 'a')).not.toBe('ending')

        provider.hovering = false
        provider.resumeTimers()

        vi.advanceTimersByTime(100)
        expect(statusOf(provider, 'a')).toBe('ending')
      })
    })

    it('does not extend the remaining time across repeated pause/resume cycles', () => {
      vi.useFakeTimers()
      withProvider((provider) => {
        provider.add({ id: 'a', title: 'a', timeout: 5000 })

        for (let cycle = 0; cycle < 2; cycle += 1) {
          vi.advanceTimersByTime(1000)
          provider.pauseTimers()
          vi.advanceTimersByTime(1000)
          provider.resumeTimers()
        }

        vi.advanceTimersByTime(2999)
        expect(statusOf(provider, 'a')).not.toBe('ending')

        vi.advanceTimersByTime(2)
        expect(statusOf(provider, 'a')).toBe('ending')
      })
    })

    it('accumulates active time across hover cycles so the toast still dismisses', () => {
      vi.useFakeTimers()
      withProvider((provider) => {
        provider.add({ id: 'a', title: 'a', timeout: 100 })

        vi.advanceTimersByTime(40)
        provider.pauseTimers()
        expect(statusOf(provider, 'a')).not.toBe('ending')

        provider.resumeTimers()
        vi.advanceTimersByTime(40)
        provider.pauseTimers()
        expect(statusOf(provider, 'a')).not.toBe('ending')

        provider.resumeTimers()
        vi.advanceTimersByTime(40)

        expect(statusOf(provider, 'a')).toBe('ending')
      })
    })

    it('restarts the full delay when the clock jumped past the timeout before pausing', () => {
      vi.useFakeTimers()
      withProvider((provider) => {
        provider.add({ id: 'a', title: 'a', timeout: 5000 })

        vi.setSystemTime(Date.now() + 60_000)
        provider.pauseTimers()
        provider.resumeTimers()

        vi.advanceTimersByTime(4999)
        expect(statusOf(provider, 'a')).not.toBe('ending')

        vi.advanceTimersByTime(1)
        expect(statusOf(provider, 'a')).toBe('ending')
      })
    })

    it('re-pauses timers after the last timed toast becomes untimed', () => {
      withProvider((provider) => {
        provider.add({ id: 'a', title: 'a', timeout: 100 })
        provider.pauseTimers()

        provider.applyUpdate('a', { timeout: 0 })

        provider.add({ id: 'b', title: 'b', timeout: 100 })
        provider.pauseTimers()
        vi.advanceTimersByTime(200)

        expect(statusOf(provider, 'b')).not.toBe('ending')
      })
    })
  })
})
