import { fireEvent, render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import BasicDialog from './fixtures/basic-dialog.svelte'
import CloseHandlers from './fixtures/close-handlers.svelte'
import DialogCloseDisabledCustomElement from './fixtures/dialog-close-disabled-custom-element.svelte'
import DialogCloseDisabled from './fixtures/dialog-close-disabled.svelte'

describe('<Dialog.Close />', () => {
  describe('prop: disabled', () => {
    it('does not close the dialog when close button is disabled', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(DialogCloseDisabled, { onOpenChange, closeDisabled: true })

      await user.click(screen.getByText('Open'))
      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(onOpenChange.mock.calls[0][0]).toBe(true)

      const closeButton = screen.getByText('Close')
      expect(closeButton).toHaveAttribute('disabled')
      expect(closeButton).toHaveAttribute('data-disabled')

      await user.click(closeButton)

      expect(onOpenChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('onclick=undefined', () => {
    it('closes the dialog when no onclick handler is provided', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicDialog, { open: false, onOpenChange })

      await user.click(screen.getByTestId('trigger'))
      expect(onOpenChange).toHaveBeenCalledWith(true)

      onOpenChange.mockClear()

      await user.click(screen.getByText('Close'))

      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(onOpenChange.mock.calls[0][0]).toBe(false)
    })
  })

  describe('custom element', () => {
    it('disabled non-button close uses aria-disabled and does not close the dialog', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(DialogCloseDisabledCustomElement, { onOpenChange })

      expect(onOpenChange).not.toHaveBeenCalled()

      await user.click(screen.getByText('Open'))
      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(onOpenChange.mock.calls[0][0]).toBe(true)

      const closeButton = screen.getByText('Close')
      expect(closeButton).not.toHaveAttribute('disabled')
      expect(closeButton).toHaveAttribute('data-disabled')
      expect(closeButton).toHaveAttribute('aria-disabled', 'true')

      await user.click(closeButton)
      expect(onOpenChange).toHaveBeenCalledTimes(1)
    })
  })

  it('does not close the dialog when the click handler is prevented', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(CloseHandlers, { open: true, onOpenChange, preventCloseHandler: true })

    await user.click(screen.getByRole('button', { name: 'Close' }))

    expect(screen.getByRole('dialog')).not.toBe(null)
    expect(onOpenChange).toHaveBeenCalledTimes(0)
  })

  it('does not request another close when clicked after the dialog has closed', async () => {
    const onOpenChange = vi.fn()
    const onclick = vi.fn()
    render(CloseHandlers, { open: false, keepMounted: true, onOpenChange, onclick })

    fireEvent.click(screen.getByRole('button', { name: 'Close', hidden: true }))

    expect(onclick).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledTimes(0)
  })
})
