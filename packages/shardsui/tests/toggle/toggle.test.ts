import { Toggle } from '$lib/components/toggle'
import { fireEvent, render, screen } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import ControlledToggle from './fixtures/controlled-toggle.svelte'
import DecliningToggle from './fixtures/declining-toggle.svelte'
import ToggleInGroup from './fixtures/toggle-in-group.svelte'

describe('<Toggle />', () => {
  describe('prop: as', () => {
    it('renders the element named by the as prop', () => {
      render(Toggle, { as: 'span' })
      expect(screen.getByRole('button').tagName).toBe('SPAN')
    })
  })

  describe('pressed state', () => {
    it('controlled', async () => {
      render(ControlledToggle)
      const checkbox = screen.getByRole('checkbox')
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-pressed', 'false')

      await fireEvent.click(checkbox)

      expect(button).toHaveAttribute('aria-pressed', 'true')

      await fireEvent.click(checkbox)

      expect(button).toHaveAttribute('aria-pressed', 'false')
    })

    it('uncontrolled', async () => {
      render(Toggle)
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-pressed', 'false')

      await fireEvent.click(button)

      expect(button).toHaveAttribute('aria-pressed', 'true')

      await fireEvent.click(button)

      expect(button).toHaveAttribute('aria-pressed', 'false')
    })

    it('does not update itself when the bound parent declines the write', async () => {
      render(DecliningToggle)
      const button = screen.getByRole('button')

      await fireEvent.click(button)

      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('prop: onPressedChange', () => {
    it('is called when the pressed state changes', async () => {
      const handlePressed = vi.fn()
      render(Toggle, { onPressedChange: handlePressed })

      await fireEvent.click(screen.getByRole('button'))

      expect(handlePressed).toHaveBeenCalledOnce()
      expect(handlePressed).toHaveBeenCalledWith(true)
    })
  })

  describe('prop: disabled', () => {
    it('disables the component', async () => {
      const handlePressed = vi.fn()
      render(Toggle, { disabled: true, onPressedChange: handlePressed })

      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('disabled')
      expect(button).toHaveAttribute('data-disabled')
      expect(button).toHaveAttribute('aria-pressed', 'false')

      await fireEvent.click(button)

      expect(handlePressed).not.toHaveBeenCalled()
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('inside ToggleGroup', () => {
    it('receives a composite tabindex', () => {
      render(ToggleInGroup)
      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0')
    })
  })
})
