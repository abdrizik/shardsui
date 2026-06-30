import { fireEvent, render, screen } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import VerticalListInKeydownListener from './fixtures/vertical-list-in-keydown-listener.svelte'

describe('<NavigationMenu.List />', () => {
  it('stops vertical navigation keys from escaping the list', () => {
    const onkeydown = vi.fn()
    render(VerticalListInKeydownListener, { onkeydown })

    const trigger = screen.getByRole('button', { name: 'Item' })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })

    expect(onkeydown.mock.calls.length).toBe(0)

    fireEvent.keyDown(trigger, { key: 'PageDown' })

    expect(onkeydown.mock.calls.length).toBe(1)
  })
})
