import { TYPEAHEAD_RESET_MS } from '$lib/internal/constants'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import TypeaheadFixture from './fixtures/typeahead-fixture.svelte'

describe('Typeahead', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rapidly focuses list items when they start with the same letter', () => {
    const spy = vi.fn()
    render(TypeaheadFixture, { items: ['one', 'two', 'three'], onMatch: spy })
    const container = screen.getByTestId('container')
    container.focus()

    fireEvent.keyDown(container, { key: 't' })
    expect(spy).toHaveBeenCalledWith(1)

    fireEvent.keyDown(container, { key: 't' })
    expect(spy).toHaveBeenCalledWith(2)

    fireEvent.keyDown(container, { key: 't' })
    expect(spy).toHaveBeenCalledWith(1)
  })

  it('bails out of rapid focus if the list contains a string starting with two of the same letter', () => {
    const spy = vi.fn()
    render(TypeaheadFixture, { items: ['apple', 'aaron', 'apricot'], onMatch: spy })
    const container = screen.getByTestId('container')
    container.focus()

    fireEvent.keyDown(container, { key: 'a' })
    expect(spy).toHaveBeenCalledWith(0)

    fireEvent.keyDown(container, { key: 'a' })
    expect(spy).toHaveBeenCalledWith(0)
  })

  it('starts from the current activeIndex and correctly loops after timeout', () => {
    const spy = vi.fn()
    render(TypeaheadFixture, {
      items: ['Toy Story 2', 'Toy Story 3', 'Toy Story 4'],
      onMatch: spy
    })
    const container = screen.getByTestId('container')
    container.focus()

    fireEvent.keyDown(container, { key: 't' })
    fireEvent.keyDown(container, { key: 'o' })
    fireEvent.keyDown(container, { key: 'y' })
    expect(spy).toHaveBeenCalledWith(0)

    spy.mockReset()

    fireEvent.keyDown(container, { key: 't' })
    fireEvent.keyDown(container, { key: 'o' })
    fireEvent.keyDown(container, { key: 'y' })
    expect(spy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(TYPEAHEAD_RESET_MS + 50)

    fireEvent.keyDown(container, { key: 't' })
    fireEvent.keyDown(container, { key: 'o' })
    fireEvent.keyDown(container, { key: 'y' })
    expect(spy).toHaveBeenCalledWith(1)

    vi.advanceTimersByTime(TYPEAHEAD_RESET_MS + 50)

    fireEvent.keyDown(container, { key: 't' })
    fireEvent.keyDown(container, { key: 'o' })
    fireEvent.keyDown(container, { key: 'y' })
    expect(spy).toHaveBeenCalledWith(2)

    vi.advanceTimersByTime(TYPEAHEAD_RESET_MS + 50)

    fireEvent.keyDown(container, { key: 't' })
    fireEvent.keyDown(container, { key: 'o' })
    fireEvent.keyDown(container, { key: 'y' })
    expect(spy).toHaveBeenCalledWith(0)
  })

  it('capslock characters continue to match (case-insensitive)', () => {
    const spy = vi.fn()
    render(TypeaheadFixture, { items: ['one', 'two', 'three'], onMatch: spy })
    const container = screen.getByTestId('container')
    container.focus()

    fireEvent.keyDown(container, { key: 'T' })
    expect(spy).toHaveBeenCalledWith(1)
  })

  it('does not depend on locale-sensitive lowercasing', () => {
    const toLocaleLowerCase = String.prototype.toLocaleLowerCase
    const toLocaleLowerCaseSpy = vi
      .spyOn(String.prototype, 'toLocaleLowerCase')
      .mockImplementation(function lowerWithTurkishLocale(this: string) {
        return toLocaleLowerCase.call(this, 'tr')
      })

    try {
      const spy = vi.fn()
      render(TypeaheadFixture, { items: ['Istanbul'], onMatch: spy })
      const container = screen.getByTestId('container')
      container.focus()

      fireEvent.keyDown(container, { key: 'i' })
      expect(spy).toHaveBeenCalledWith(0)
    } finally {
      toLocaleLowerCaseSpy.mockRestore()
    }
  })

  it('matches when focus is within reference', () => {
    const spy = vi.fn()
    render(TypeaheadFixture, { items: ['one', 'two', 'three'], nestedInput: true, onMatch: spy })
    const input = screen.getByTestId('nested-input')
    input.focus()

    fireEvent.keyDown(input, { key: 't' })
    expect(spy).toHaveBeenCalledWith(1)
  })

  it('does not let hidden double-letter items block rapid cycling', () => {
    const spy = vi.fn()
    render(TypeaheadFixture, {
      items: ['aaron', 'apple', 'avocado'],
      hiddenIndices: [0],
      onMatch: spy
    })
    const container = screen.getByTestId('container')
    container.focus()

    fireEvent.keyDown(container, { key: 'a' })
    expect(spy).toHaveBeenLastCalledWith(1)

    fireEvent.keyDown(container, { key: 'a' })
    expect(spy).toHaveBeenLastCalledWith(2)
  })

  it('matches when focus moves to a list item (floating)', async () => {
    const spy = vi.fn()
    render(TypeaheadFixture, { items: ['one', 'two', 'three'], onMatch: spy })
    const container = screen.getByTestId('container')
    container.focus()

    fireEvent.keyDown(container, { key: 't' })
    await waitFor(() => expect(spy).toHaveBeenCalledWith(1))

    spy.mockReset()
    vi.advanceTimersByTime(TYPEAHEAD_RESET_MS + 50)

    const item1 = screen.getByTestId('item-1')
    item1.focus()
    fireEvent.keyDown(item1, { key: 't' })
    expect(spy).toHaveBeenCalledWith(2)
  })

  it('onTyping is called when typing starts and when reset timer fires', async () => {
    const spy = vi.fn()
    render(TypeaheadFixture, {
      items: ['one', 'two', 'three'],
      onTyping: spy
    })
    const container = screen.getByTestId('container')
    container.focus()

    fireEvent.keyDown(container, { key: 't' })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(true)

    vi.advanceTimersByTime(TYPEAHEAD_RESET_MS + 50)
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(false)
  })

  it('skips hidden items (display:none) when matching with elements', () => {
    const spy = vi.fn()
    render(TypeaheadFixture, {
      items: ['apple', 'apricot', 'banana'],
      hiddenIndices: [0],
      onMatch: spy
    })
    const container = screen.getByTestId('container')
    container.focus()

    fireEvent.keyDown(container, { key: 'a' })
    expect(spy).toHaveBeenCalledWith(1)
  })

  it('skips visibility:hidden items when matching with elements', () => {
    const spy = vi.fn()
    render(TypeaheadFixture, {
      items: ['apple', 'apricot', 'banana'],
      onMatch: spy
    })
    const container = screen.getByTestId('container')

    const item0 = screen.getByTestId('item-0')
    item0.style.visibility = 'hidden'

    container.focus()
    fireEvent.keyDown(container, { key: 'a' })
    expect(spy).toHaveBeenCalledWith(1)
  })
})
