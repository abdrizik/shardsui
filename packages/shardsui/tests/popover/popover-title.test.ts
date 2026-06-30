import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import PopoverWithTitle from './fixtures/popover-with-title.svelte'

describe('<Popover.Title />', () => {
  it('labels the popup element with its id', async () => {
    render(PopoverWithTitle, { open: true })

    const popup = screen.getByRole('dialog')
    const titleId = document.querySelector('h2')?.getAttribute('id')
    expect(titleId).toBeTruthy()
    expect(popup.getAttribute('aria-labelledby')).toBe(titleId)
  })
})
