import { SHARDSUI_INERT_ATTRIBUTE } from '$lib/internal/constants'
import { markOthers } from '$lib/internal/floating/mark-others'
import { afterEach, expect, it } from 'vitest'

afterEach(() => {
  document.body.innerHTML = ''
})

it('single call', () => {
  const other = document.createElement('div')
  document.body.appendChild(other)
  const target = document.createElement('div')
  document.body.appendChild(target)

  const cleanup = markOthers([target], { ariaHidden: true })

  expect(other.getAttribute('aria-hidden')).toBe('true')

  cleanup()

  expect(other.getAttribute('aria-hidden')).toBe(null)
})

it('multiple calls', () => {
  const other = document.createElement('div')
  document.body.appendChild(other)
  const target = document.createElement('div')
  document.body.appendChild(target)

  const cleanup = markOthers([target], { ariaHidden: true })

  expect(other.getAttribute('aria-hidden')).toBe('true')

  const nextTarget = document.createElement('div')
  document.body.appendChild(nextTarget)

  const nextCleanup = markOthers([nextTarget], { ariaHidden: true })

  expect(target.getAttribute('aria-hidden')).toBe('true')
  expect(nextTarget.getAttribute('aria-hidden')).toBe(null)

  document.body.removeChild(nextTarget)

  nextCleanup()

  expect(target.getAttribute('aria-hidden')).toBe(null)
  expect(other.getAttribute('aria-hidden')).toBe('true')

  cleanup()

  expect(other.getAttribute('aria-hidden')).toBe(null)

  document.body.appendChild(nextTarget)
})

it('out of order cleanup', () => {
  const other = document.createElement('div')
  document.body.appendChild(other)
  const target = document.createElement('div')
  target.setAttribute('data-testid', '')
  document.body.appendChild(target)

  const cleanup = markOthers([target], { ariaHidden: true })

  expect(other.getAttribute('aria-hidden')).toBe('true')

  const nextTarget = document.createElement('div')
  document.body.appendChild(nextTarget)

  const nextCleanup = markOthers([nextTarget], { ariaHidden: true })

  expect(target.getAttribute('aria-hidden')).toBe('true')
  expect(nextTarget.getAttribute('aria-hidden')).toBe(null)

  cleanup()

  expect(nextTarget.getAttribute('aria-hidden')).toBe(null)
  expect(target.getAttribute('aria-hidden')).toBe('true')
  expect(other.getAttribute('aria-hidden')).toBe('true')

  nextCleanup()

  expect(nextTarget.getAttribute('aria-hidden')).toBe(null)
  expect(other.getAttribute('aria-hidden')).toBe(null)
  expect(target.getAttribute('aria-hidden')).toBe(null)
})

it('multiple cleanups with differing options', () => {
  const other = document.createElement('div')
  document.body.appendChild(other)
  const target = document.createElement('div')
  target.setAttribute('data-testid', '1')
  document.body.appendChild(target)

  const cleanup = markOthers([target], { ariaHidden: true })

  expect(other.getAttribute('aria-hidden')).toBe('true')

  const target2 = document.createElement('div')
  target2.setAttribute('data-testid', '2')
  document.body.appendChild(target2)

  const cleanup2 = markOthers([target2])

  expect(target.getAttribute('aria-hidden')).not.toBe('true')
  expect(target.getAttribute(SHARDSUI_INERT_ATTRIBUTE)).toBe('')

  cleanup()

  expect(other.getAttribute('aria-hidden')).toBe(null)

  cleanup2()

  expect(target.getAttribute(SHARDSUI_INERT_ATTRIBUTE)).toBe(null)
})

it('preserves externally owned aria-hidden during concurrent overlaps', () => {
  const keep = document.createElement('div')
  const outside = document.createElement('div')
  outside.setAttribute('aria-hidden', 'true')
  document.body.append(keep, outside)

  let cleanupFirst: (() => void) | undefined
  let cleanupSecond: (() => void) | undefined

  try {
    cleanupFirst = markOthers([keep], { ariaHidden: true, mark: false })
    cleanupSecond = markOthers([keep], { ariaHidden: true, mark: false })

    expect(outside).toHaveAttribute('aria-hidden', 'true')

    cleanupSecond()
    cleanupSecond = undefined

    expect(outside).toHaveAttribute('aria-hidden', 'true')

    cleanupFirst()
    cleanupFirst = undefined

    expect(outside).toHaveAttribute('aria-hidden', 'true')
  } finally {
    cleanupSecond?.()
    cleanupFirst?.()
  }
})

it('does not let mark-only overlap disturb control cleanup bookkeeping', () => {
  const keep = document.createElement('div')
  const outside = document.createElement('div')
  document.body.append(keep, outside)

  let cleanupMarkOnly: (() => void) | undefined
  let cleanupControlOnly: (() => void) | undefined

  try {
    cleanupMarkOnly = markOthers([keep], { mark: true })
    cleanupControlOnly = markOthers([keep], { ariaHidden: true, mark: false })

    expect(outside).toHaveAttribute(SHARDSUI_INERT_ATTRIBUTE)
    expect(outside).toHaveAttribute('aria-hidden', 'true')

    cleanupMarkOnly()
    cleanupMarkOnly = undefined

    expect(outside).not.toHaveAttribute(SHARDSUI_INERT_ATTRIBUTE)
    expect(outside).toHaveAttribute('aria-hidden', 'true')

    cleanupControlOnly()
    cleanupControlOnly = undefined

    expect(outside).not.toHaveAttribute(SHARDSUI_INERT_ATTRIBUTE)
    expect(outside).not.toHaveAttribute('aria-hidden')
  } finally {
    cleanupControlOnly?.()
    cleanupMarkOnly?.()
  }
})
