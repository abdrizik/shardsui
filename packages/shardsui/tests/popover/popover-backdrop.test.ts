import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import BasicPopover from './fixtures/basic-popover.svelte'
import PopoverHoverBackdrop from './fixtures/popover-hover-backdrop.svelte'

describe('<Popover.Backdrop />', () => {
  describe('outside press with user backdrop', () => {
    it('uses intentional outside press on the user backdrop: closes on click — not pointerdown', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(BasicPopover, {
        open: true,
        onOpenChange,
        includeBackdrop: true
      })

      const backdrop = screen.getByTestId('backdrop')
      fireEvent.pointerDown(backdrop, { pointerType: 'mouse', button: 0 })
      expect(screen.queryByRole('dialog')).not.toBeNull()

      await user.click(backdrop)
      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  describe('prop: modal, internal backdrop', () => {
    it('renders an internal backdrop (role=presentation) when modal=true and open', async () => {
      const user = userEvent.setup()
      render(BasicPopover, { modal: true })

      await user.click(screen.getByTestId('trigger'))

      const positioner = screen.getByTestId('positioner')
      expect(positioner.previousElementSibling).toHaveAttribute('role', 'presentation')
    })

    it('does not render an internal backdrop when modal=false', async () => {
      const user = userEvent.setup()
      render(BasicPopover, { modal: false })

      await user.click(screen.getByTestId('trigger'))

      const positioner = screen.getByTestId('positioner')
      expect(positioner.previousElementSibling).toBeNull()
    })
  })

  describe('pointer-events', () => {
    it('sets pointer-events:none on the backdrop when opened by hover', async () => {
      render(PopoverHoverBackdrop, { delay: 0 })

      const trigger = screen.getByTestId('trigger')
      await fireEvent.mouseEnter(trigger)
      await fireEvent.mouseMove(trigger)

      await waitFor(() => expect(screen.getByTestId('popover-popup')).toBeInTheDocument())
      expect(screen.getByTestId('backdrop').style.pointerEvents).toBe('none')
    })

    it('does not set pointer-events:none on the backdrop when opened by click', async () => {
      const user = userEvent.setup()
      render(PopoverHoverBackdrop, { delay: 300 })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.getByTestId('backdrop').style.pointerEvents).not.toBe('none')
      })
    })
  })
})
