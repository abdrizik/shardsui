import { watch, watchPre } from '$lib/internal/watch.svelte'
import { flushSync } from 'svelte'
import { expect, it, vi } from 'vitest'

describe('watch', () => {
  it('does not run on the initial flush', () => {
    const spy = vi.fn()

    const cleanup = $effect.root(() => {
      const count = $state(0)
      watch(() => count, spy)
      flushSync()

      expect(spy).not.toHaveBeenCalled()
    })

    cleanup()
  })

  it('runs with the current and previous value when the source changes', () => {
    const spy = vi.fn()

    const cleanup = $effect.root(() => {
      let count = $state(0)
      watch(() => count, spy)
      flushSync()

      count = 1
      flushSync()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(1, 0)

      count = 5
      flushSync()

      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenLastCalledWith(5, 1)
    })

    cleanup()
  })

  it('skips when the source settles back to an Object.is-equal value', () => {
    const spy = vi.fn()

    const cleanup = $effect.root(() => {
      let count = $state(0)
      watch(() => count, spy)
      flushSync()

      count = 1
      count = 0
      flushSync()

      expect(spy).not.toHaveBeenCalled()
    })

    cleanup()
  })

  it('honours a custom equals', () => {
    const spy = vi.fn()

    const cleanup = $effect.root(() => {
      let value = $state({ id: 1 })
      watch(() => value, spy, { equals: (a, b) => a.id === b.id })
      flushSync()

      value = { id: 1 }
      flushSync()
      expect(spy).not.toHaveBeenCalled()

      value = { id: 2 }
      flushSync()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    cleanup()
  })

  it('does not track state read inside the callback', () => {
    const spy = vi.fn()

    const cleanup = $effect.root(() => {
      let count = $state(0)
      let other = $state('a')
      watch(
        () => count,
        () => {
          spy(other)
        }
      )
      flushSync()

      count = 1
      flushSync()
      expect(spy).toHaveBeenCalledTimes(1)

      other = 'b'
      flushSync()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    cleanup()
  })

  it('runs the cleanup returned by the callback before the next run', () => {
    const order: string[] = []

    const cleanup = $effect.root(() => {
      let count = $state(0)
      watch(
        () => count,
        (current) => {
          order.push(`run:${current}`)
          return () => order.push(`cleanup:${current}`)
        }
      )
      flushSync()

      count = 1
      flushSync()
      expect(order).toEqual(['run:1'])

      count = 2
      flushSync()
      expect(order).toEqual(['run:1', 'cleanup:1', 'run:2'])
    })

    cleanup()
  })

  it('runs the last cleanup when the effect root is destroyed', () => {
    const order: string[] = []

    const cleanup = $effect.root(() => {
      let count = $state(0)
      watch(
        () => count,
        () => () => order.push('cleanup')
      )
      flushSync()

      count = 1
      flushSync()
    })

    expect(order).toEqual([])
    cleanup()

    expect(order).toEqual(['cleanup'])
  })

  it('drops the pending cleanup when a rerun skips as equal', () => {
    const order: string[] = []

    const cleanup = $effect.root(() => {
      let count = $state(1)
      watch(
        () => count > 0,
        (current) => {
          order.push(`run:${current}`)
          return () => order.push(`cleanup:${current}`)
        }
      )
      flushSync()

      count = 0
      flushSync()
      expect(order).toEqual(['run:false'])

      count = -1
      flushSync()
      expect(order).toEqual(['run:false', 'cleanup:false'])
    })

    cleanup()
    expect(order).toEqual(['run:false', 'cleanup:false'])
  })
})

describe('watchPre', () => {
  it('runs before a plain effect reading the same source', () => {
    const order: string[] = []

    const cleanup = $effect.root(() => {
      let count = $state(0)
      watchPre(
        () => count,
        () => {
          order.push('pre')
        }
      )
      $effect(() => {
        if (count > 0) order.push('post')
      })
      flushSync()

      order.length = 0
      count = 1
      flushSync()

      expect(order).toEqual(['pre', 'post'])
    })

    cleanup()
  })
})
