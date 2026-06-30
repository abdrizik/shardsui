import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AsCollapsible from './fixtures/as-collapsible.svelte'
import BasicCollapsible from './fixtures/basic-collapsible.svelte'
import ControlledCollapsible from './fixtures/controlled-collapsible.svelte'
import CustomIdCollapsible from './fixtures/custom-id-collapsible.svelte'
import DecliningCollapsible from './fixtures/declining-collapsible.svelte'
import OptionalPanelCollapsible from './fixtures/optional-panel-collapsible.svelte'
import SnippetStateCollapsible from './fixtures/snippet-state-collapsible.svelte'

const PANEL_CONTENT = 'This is panel content'

describe('<Collapsible.Root />', () => {
  describe('prop: as', () => {
    it('renders a custom element', () => {
      render(AsCollapsible, { rootAs: 'section' })

      expect(screen.getByTestId('root').tagName.toLowerCase()).toBe('section')
    })
  })

  describe('ARIA attributes', () => {
    it('sets ARIA attributes', () => {
      render(BasicCollapsible, { open: true })

      const trigger = screen.getByRole('button')
      const panel = screen.getByText(PANEL_CONTENT)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('aria-controls')
      expect(trigger.getAttribute('aria-controls')).toBe(panel.getAttribute('id'))
    })

    it('references manual panel id in trigger aria-controls', () => {
      render(CustomIdCollapsible, { panelId: 'custom-panel-id' })

      const trigger = screen.getByRole('button')
      const panel = screen.getByTestId('panel')

      expect(trigger).toHaveAttribute('aria-controls', 'custom-panel-id')
      expect(panel).toHaveAttribute('id', 'custom-panel-id')
    })

    it('unregisters and restores the generated panel id when the panel remounts', async () => {
      const { rerender } = render(OptionalPanelCollapsible, { panelMounted: true })
      const trigger = screen.getByRole('button')

      await rerender({ panelMounted: false })
      expect(trigger).not.toHaveAttribute('aria-controls')

      await rerender({ panelMounted: true })
      expect(trigger).toHaveAttribute('aria-controls', screen.getByTestId('panel').id)
    })
  })

  describe('collapsible status', () => {
    it('disabled status', () => {
      render(BasicCollapsible, { disabled: true })

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled')
    })

    it('does not toggle or call onOpenChange when clicked while disabled', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()

      render(BasicCollapsible, { disabled: true, onOpenChange: handleOpenChange })

      const trigger = screen.getByRole('button')

      await user.click(trigger)

      expect(handleOpenChange).not.toHaveBeenCalled()
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT)).toBe(null)
    })
  })

  describe('prop: onOpenChange', () => {
    it('calls onOpenChange with the next open state', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()

      render(BasicCollapsible, { onOpenChange: handleOpenChange })

      const trigger = screen.getByRole('button')

      await user.click(trigger)
      expect(handleOpenChange).toHaveBeenCalledTimes(1)
      expect(handleOpenChange).toHaveBeenLastCalledWith(true)

      await user.click(trigger)
      expect(handleOpenChange).toHaveBeenCalledTimes(2)
      expect(handleOpenChange).toHaveBeenLastCalledWith(false)
    })

    it('declining the open change prevents opening', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()

      render(DecliningCollapsible, { onOpenChange: handleOpenChange })

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      expect(handleOpenChange).toHaveBeenCalledTimes(1)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT)).toBe(null)
    })

    it('declining the open change prevents closing', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()

      render(DecliningCollapsible, { open: true, onOpenChange: handleOpenChange })

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      expect(handleOpenChange).toHaveBeenCalledTimes(1)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(screen.queryByText(PANEL_CONTENT)).not.toBe(null)
    })
  })

  describe.skipIf(isJSDOM)('open state', () => {
    it('controlled trigger presses request open and close state changes', async () => {
      const user = userEvent.setup()
      render(ControlledCollapsible)

      const trigger = screen.getByRole('button', { name: 'Trigger' })

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT)).toBe(null)

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(screen.queryByText(PANEL_CONTENT)).not.toBe(null)

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT)).toBe(null)
    })

    it('controlled mode', async () => {
      const user = userEvent.setup()
      render(ControlledCollapsible)

      const externalTrigger = screen.getByRole('button', { name: 'toggle externally' })
      const trigger = screen.getByRole('button', { name: 'Trigger' })

      expect(trigger).not.toHaveAttribute('aria-controls')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT)).toBe(null)

      await user.click(externalTrigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('aria-controls')
      expect(trigger).toHaveAttribute('data-panel-open')
      expect(screen.queryByText(PANEL_CONTENT)).not.toBe(null)
      expect(screen.queryByText(PANEL_CONTENT)).toHaveAttribute('data-open')

      await user.click(externalTrigger)

      expect(trigger).not.toHaveAttribute('aria-controls')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT)).toBe(null)
    })

    it('uncontrolled mode', async () => {
      const user = userEvent.setup()
      render(BasicCollapsible)

      const trigger = screen.getByRole('button')

      expect(trigger).not.toHaveAttribute('aria-controls')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT)).toBe(null)

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('aria-controls')
      expect(trigger).toHaveAttribute('data-panel-open')
      expect(screen.queryByText(PANEL_CONTENT)).not.toBe(null)
      expect(screen.queryByText(PANEL_CONTENT)).toHaveAttribute('data-open')

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).not.toHaveAttribute('aria-controls')
      expect(trigger).not.toHaveAttribute('data-panel-open')
      expect(screen.queryByText(PANEL_CONTENT)).toBe(null)
    })
  })

  describe.skipIf(isJSDOM)('keyboard interactions', () => {
    it.each(['Enter', 'Space'])(
      'key: %s does not toggle or call onOpenChange when disabled',
      async (key) => {
        const user = userEvent.setup()
        const handleOpenChange = vi.fn()

        render(BasicCollapsible, { disabled: true, onOpenChange: handleOpenChange })

        const trigger = screen.getByRole('button')

        await user.keyboard('[Tab]')
        expect(trigger).toHaveFocus()

        await user.keyboard(`[${key}]`)

        expect(handleOpenChange).not.toHaveBeenCalled()
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByText(PANEL_CONTENT)).toBe(null)
      }
    )

    it.each(['Enter', 'Space'])('key: %s should toggle the Collapsible', async (key) => {
      const user = userEvent.setup()
      render(BasicCollapsible)

      const trigger = screen.getByRole('button')

      expect(trigger).not.toHaveAttribute('aria-controls')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText(PANEL_CONTENT)).toBe(null)

      await user.keyboard('[Tab]')
      expect(trigger).toHaveFocus()
      await user.keyboard(`[${key}]`)

      expect(trigger).toHaveAttribute('aria-controls')
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger).toHaveAttribute('data-panel-open')
      expect(screen.queryByText(PANEL_CONTENT)).not.toBe(null)
      expect(screen.queryByText(PANEL_CONTENT)).toHaveAttribute('data-open')

      await user.keyboard(`[${key}]`)

      expect(trigger).not.toHaveAttribute('aria-controls')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).not.toHaveAttribute('data-panel-open')
      expect(screen.queryByText(PANEL_CONTENT)).toBe(null)
    })
  })

  describe('snippet state', () => {
    it('passes state to the children snippet', async () => {
      const user = userEvent.setup()
      render(SnippetStateCollapsible)

      expect(screen.getByTestId('root-state')).toHaveTextContent('closed')
      expect(screen.getByTestId('trigger-state')).toHaveTextContent('closed')
      expect(screen.getByTestId('panel-state')).toHaveTextContent('closed')

      await user.click(screen.getByRole('button'))

      expect(screen.getByTestId('root-state')).toHaveTextContent('open')
      expect(screen.getByTestId('trigger-state')).toHaveTextContent('open')
      expect(screen.getByTestId('panel-state')).toHaveTextContent('open')
    })
  })
})
