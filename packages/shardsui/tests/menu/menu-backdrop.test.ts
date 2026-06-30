import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import MenuWithBackdrop from './fixtures/menu-with-backdrop.svelte'

describe('<Menu.Backdrop />', () => {
  it('sets pointer-events: none style on backdrop if opened by hover', async () => {
    const user = userEvent.setup()
    render(MenuWithBackdrop, { openOnHover: true, delay: 0 })

    await user.hover(screen.getByText('Open'))

    await waitFor(() => {
      expect(screen.getByTestId('backdrop').style.pointerEvents).toBe('none')
    })
  })

  it('does not set pointer-events: none style on backdrop if opened by click', async () => {
    const user = userEvent.setup()
    render(MenuWithBackdrop)

    await user.click(screen.getByRole('button', { name: 'Open' }))

    await waitFor(() => {
      expect(screen.getByTestId('backdrop').style.pointerEvents).not.toBe('none')
    })
  })
})
