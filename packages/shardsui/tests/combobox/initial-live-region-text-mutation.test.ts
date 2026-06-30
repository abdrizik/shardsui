import { initialLiveRegionTextMutation } from '$lib/components/combobox/initial-live-region-text-mutation'
import { afterEach, expect, vi } from 'vitest'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('initialLiveRegionTextMutation', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('skips empty text nodes when finding the announcement text', () => {
    const text = document.createTextNode('Status')
    const empty = document.createTextNode('')
    const status = document.createElement('div')
    status.append(text, empty)

    initialLiveRegionTextMutation(status)

    expect(text.data).toBe('Status\u2060')
    expect(empty.data).toBe('')
  })

  it('does not overwrite text that changes before the reset', () => {
    vi.useFakeTimers()

    const status = document.createElement('div')
    status.textContent = 'Status'

    initialLiveRegionTextMutation(status)
    status.firstChild!.nodeValue = 'Updated'

    vi.runAllTimers()

    expect(status).toHaveTextContent('Updated')
  })
})
