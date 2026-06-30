import { Tooltip } from '$lib/components/tooltip'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicTooltip from './fixtures/basic-tooltip.svelte'
import ContainedControlled from './fixtures/contained-controlled.svelte'
import MultiTriggerWithin from './fixtures/multi-trigger-within.svelte'
import SpacedTriggers from './fixtures/spaced-triggers.svelte'
import TooltipCustomTriggerId from './fixtures/tooltip-custom-trigger-id.svelte'
import TooltipMultiTriggerFocus from './fixtures/tooltip-multi-trigger-focus.svelte'
import TooltipTriggerWithoutRoot from './fixtures/tooltip-trigger-without-root.svelte'

describe('<Tooltip.Trigger />', () => {
  it('throws a descriptive error when rendered without a root or a handle', () => {
    expect(() => render(TooltipTriggerWithoutRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <Tooltip.Root>.'
    )
  })

  it('removes data-popup-open as soon as open becomes false', async () => {
    render(BasicTooltip, { delay: 0 })

    const trigger = screen.getByTestId('trigger')
    trigger.focus()

    await waitFor(() => {
      expect(trigger).toHaveAttribute('data-popup-open')
    })

    trigger.blur()

    await waitFor(() => {
      expect(trigger).not.toHaveAttribute('data-popup-open')
    })
  })

  it('opens when the rendered trigger element has its own id', async () => {
    const user = userEvent.setup({ delay: null })
    render(TooltipCustomTriggerId)

    const trigger = screen.getByTestId('trigger')
    expect(trigger).toHaveAttribute('id', 'custom-button')

    await user.hover(trigger)

    await waitFor(() => {
      expect(screen.queryByTestId('popup')).not.toBeNull()
    })
    expect(trigger).toHaveAttribute('data-popup-open')
  })

  describe('spaced triggers', () => {
    it('keeps the tooltip open when moving across spaced triggers without a closeDelay', async () => {
      const user = userEvent.setup({ delay: null })
      const handle = new Tooltip.Handle()
      render(SpacedTriggers, { handle })
      await tick()

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')
      const trigger3 = screen.getByTestId('trigger-3')

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())

      await user.unhover(trigger1)
      await user.hover(trigger2)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())

      fireEvent.mouseLeave(trigger2, { relatedTarget: document.body, clientX: 120, clientY: 0 })
      await user.hover(trigger3)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())

      fireEvent.mouseMove(document.body, { clientX: 300, clientY: 0 })
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
    })
  })

  describe.skipIf(isJSDOM)('multiple triggers within Root', () => {
    it('open the tooltip with any trigger on hover', async () => {
      const user = userEvent.setup({ delay: null })
      render(TooltipMultiTriggerFocus)

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')
      const trigger3 = screen.getByTestId('trigger-3')

      expect(screen.queryByTestId('popup')).toBeNull()

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      await user.unhover(trigger1)
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      await user.hover(trigger2)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      await user.unhover(trigger2)
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      await user.hover(trigger3)
      await waitFor(() => expect(screen.getByTestId('popup')).toBeVisible())
      await user.unhover(trigger3)
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
    })

    it('open the tooltip with any trigger on focus', async () => {
      render(TooltipMultiTriggerFocus)

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')
      const trigger3 = screen.getByTestId('trigger-3')

      expect(screen.queryByTestId('popup')).toBeNull()

      trigger1.focus()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      trigger1.blur()
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      trigger2.focus()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      trigger2.blur()
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())

      trigger3.focus()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
      trigger3.blur()
      await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
    })

    it('renders the payload of whichever trigger is hovered', async () => {
      const user = userEvent.setup({ delay: null })
      render(MultiTriggerWithin, { open: false })

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      await user.hover(trigger1)
      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('1'))

      await user.unhover(trigger1)
      await user.hover(trigger2)
      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('2'))
    })

    it('hands off open state and payload to a trigger with its own DOM id while open', async () => {
      render(MultiTriggerWithin, { open: false })

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      expect(trigger2).toHaveAttribute('id', 'trigger-2')

      trigger1.focus()
      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('1'))

      trigger2.focus()
      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('2'))
      expect(trigger2).toHaveAttribute('data-popup-open')
    })

    it('reuses the popup and positioner DOM nodes when switching triggers', async () => {
      render(MultiTriggerWithin, { open: false })

      const trigger1 = screen.getByTestId('trigger-1')
      const trigger2 = screen.getByTestId('trigger-2')

      trigger1.focus()
      await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

      const popupElement = screen.getByTestId('popup')
      const positionerElement = screen.getByTestId('positioner')

      trigger2.focus()
      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('2'))

      expect(screen.getByTestId('popup')).toBe(popupElement)
      expect(screen.getByTestId('positioner')).toBe(positionerElement)
    })

    it('close when the active trigger unmounts', async () => {
      render(MultiTriggerWithin, { open: true })

      await waitFor(() => expect(screen.getByTestId('content')).toHaveTextContent('1'))

      await fireEvent.click(screen.getByTestId('remove-first'))

      const trigger2 = screen.getByTestId('trigger-2')
      await waitFor(() => expect(screen.queryByTestId('trigger-1')).toBeNull())
      await waitFor(() => expect(trigger2).not.toHaveAttribute('data-popup-open'))
      await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())
    })

    it('allows controlling the tooltip state programmatically', async () => {
      const user = userEvent.setup({ delay: null })
      render(ContainedControlled)

      await user.click(screen.getByTestId('open-1'))
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await user.click(screen.getByTestId('open-2'))
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

      await user.click(screen.getByTestId('close'))
      await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())
    })

    it('allows setting an initially open tooltip', async () => {
      render(MultiTriggerWithin, { open: true, triggerId: 'trigger-2' })

      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
    })
  })
})
