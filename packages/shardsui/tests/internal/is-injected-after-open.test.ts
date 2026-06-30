import { SHARDSUI_INERT_ATTRIBUTE } from '$lib/internal/constants'
import { isInjectedAfterOpen } from '$lib/internal/is-injected-after-open'
import { beforeEach, describe, expect, it } from 'vitest'

describe('isInjectedAfterOpen', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('is false without markers', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)

    expect(isInjectedAfterOpen(target, null)).toBe(false)
  })

  it('is true only when the top-level ancestor carries no marker', () => {
    const marked = document.createElement('div')
    marked.setAttribute(SHARDSUI_INERT_ATTRIBUTE, '')
    const inside = document.createElement('span')
    marked.appendChild(inside)
    const injected = document.createElement('div')
    document.body.append(marked, injected)

    expect(isInjectedAfterOpen(inside, null)).toBe(false)
    expect(isInjectedAfterOpen(injected, null)).toBe(true)
  })
})
