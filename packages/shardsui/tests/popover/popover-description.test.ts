import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import PopoverDescriptionOnly from './fixtures/popover-description-only.svelte'

describe('<Popover.Description />', () => {
  it('describes the popup element with the rendered p id', async () => {
    render(PopoverDescriptionOnly)

    const popup = screen.getByRole('dialog')
    const p = document.querySelector('p')
    expect(p?.id).toBeTruthy()
    expect(popup.getAttribute('aria-describedby')).toBe(p?.id)
  })
})
