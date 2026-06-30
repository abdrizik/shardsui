import { DEFAULT_LABELABLE } from '$lib/internal/labelable.svelte'
import { registerLabelId } from '$lib/internal/register-label-id'
import { describe, expect, it } from 'vitest'

describe('registerLabelId', () => {
  it('publishes the id while mounted and clears it on unmount', () => {
    const el = document.createElement('span')
    const target: { labelId: string | undefined } = { labelId: undefined }

    const cleanup = registerLabelId(target, 'a')(el)
    expect(target.labelId).toBe('a')

    cleanup?.()
    expect(target.labelId).toBeUndefined()
  })

  it('leaves a later sibling registration alone when an earlier one unmounts', () => {
    const first = document.createElement('span')
    const second = document.createElement('span')
    const target: { labelId: string | undefined } = { labelId: undefined }

    const cleanupFirst = registerLabelId(target, 'a')(first)
    const cleanupSecond = registerLabelId(target, 'b')(second)
    expect(target.labelId).toBe('b')

    cleanupFirst?.()
    expect(target.labelId).toBe('b')

    cleanupSecond?.()
    expect(target.labelId).toBeUndefined()
  })

  it('cannot write a label id onto the shared fallback context', () => {
    const el = document.createElement('span')

    const cleanup = registerLabelId(DEFAULT_LABELABLE, 'a')(el)
    expect(DEFAULT_LABELABLE.labelId).toBeUndefined()

    cleanup?.()
  })
})
