import { ToggleGroup } from '$lib/components/toggle-group'
import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AriaLabelToggleGroup from './fixtures/aria-label-toggle-group.svelte'
import BasicToggleGroup from './fixtures/basic-toggle-group.svelte'
import DecliningToggleGroup from './fixtures/declining-toggle-group.svelte'
import DirectionToggleGroup from './fixtures/direction-toggle-group.svelte'
import IndividualDisabledToggleGroup from './fixtures/individual-disabled-toggle-group.svelte'
import LateToggleUncontrolledGroup from './fixtures/late-toggle-uncontrolled-group.svelte'
import MissingValueToggleGroup from './fixtures/missing-value-toggle-group.svelte'
import MultipleTransitionToggleGroup from './fixtures/multiple-transition-toggle-group.svelte'
import OmitValueSingleToggleGroup from './fixtures/omit-value-single-toggle-group.svelte'
import OmitValueToggleGroup from './fixtures/omit-value-toggle-group.svelte'

describe('<ToggleGroup />', () => {
  it('renders the element specified by the as prop', () => {
    render(ToggleGroup, { as: 'section' })
    expect(screen.getByRole('group').tagName).toBe('SECTION')
  })

  it('renders a `group` with an accessible name from aria-label', () => {
    render(AriaLabelToggleGroup)
    expect(screen.queryByRole('group', { name: 'My Toggle Group' })).not.toBe(null)
  })

  describe.skipIf(isJSDOM)('uncontrolled click interactions', () => {
    it('clicking a button toggles its aria-pressed to true', async () => {
      const user = userEvent.setup()
      render(BasicToggleGroup)
      const [btn1, btn2] = screen.getAllByRole('button')

      expect(btn1).toHaveAttribute('aria-pressed', 'false')
      expect(btn2).toHaveAttribute('aria-pressed', 'false')

      await user.click(btn1)

      expect(btn1).toHaveAttribute('aria-pressed', 'true')
      expect(btn1).toHaveAttribute('data-pressed')
      expect(btn2).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('prop: value', () => {
    it('pre-selects the button matching initial value', async () => {
      const user = userEvent.setup()
      render(BasicToggleGroup, { value: ['two'] })
      const [btn1, btn2] = screen.getAllByRole('button')

      expect(btn1).toHaveAttribute('aria-pressed', 'false')
      expect(btn2).toHaveAttribute('aria-pressed', 'true')
      expect(btn2).toHaveAttribute('data-pressed')

      await user.click(btn1)

      expect(btn1).toHaveAttribute('aria-pressed', 'true')
      expect(btn1).toHaveAttribute('data-pressed')
      expect(btn2).toHaveAttribute('aria-pressed', 'false')
    })

    it('pressed state follows the value prop after mount', async () => {
      const { rerender } = render(BasicToggleGroup, { value: ['two'] })
      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('data-pressed')

      await rerender({ value: ['one'] })

      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button1).toHaveAttribute('data-pressed')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await rerender({ value: ['two'] })

      expect(button2).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('data-pressed')
      expect(button1).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('prop: multiple', () => {
    it('sets data-multiple only when true', async () => {
      const { rerender } = render(BasicToggleGroup, {})

      const group = screen.getByRole('group')
      expect(group).not.toHaveAttribute('data-multiple')

      await rerender({ multiple: true })
      expect(group).toHaveAttribute('data-multiple')

      await rerender({ multiple: false })
      expect(group).not.toHaveAttribute('data-multiple')
    })

    it('multiple items can be pressed when true', async () => {
      const user = userEvent.setup()
      render(BasicToggleGroup, { multiple: true, value: ['one'] })
      const [btn1, btn2] = screen.getAllByRole('button')

      expect(btn1).toHaveAttribute('aria-pressed', 'true')
      expect(btn2).toHaveAttribute('aria-pressed', 'false')

      await user.click(btn2)

      expect(btn1).toHaveAttribute('aria-pressed', 'true')
      expect(btn2).toHaveAttribute('aria-pressed', 'true')
    })

    it('only one item can be pressed when false', async () => {
      const user = userEvent.setup()
      render(BasicToggleGroup, { value: ['one'] })
      const [btn1, btn2] = screen.getAllByRole('button')

      expect(btn1).toHaveAttribute('aria-pressed', 'true')
      expect(btn2).toHaveAttribute('aria-pressed', 'false')

      await user.click(btn2)

      expect(btn1).toHaveAttribute('aria-pressed', 'false')
      expect(btn2).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe.skipIf(isJSDOM)('prop: multiple transitions', () => {
    it.each([
      ['standalone', false],
      ['nested in Toolbar.Group', true]
    ] as const)('preserves selection and roving focus when %s', async (_label, inToolbar) => {
      const user = userEvent.setup()
      const { rerender } = render(MultipleTransitionToggleGroup, { multiple: false, inToolbar })

      const group = screen.getByTestId('toggle-group')
      const [button1, button2] = screen.getAllByRole('button')

      expect(group).not.toHaveAttribute('data-multiple')
      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.keyboard('[Tab][ArrowRight]')
      expect(button2).toHaveFocus()

      await user.click(button2)
      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'true')

      await rerender({ multiple: true, inToolbar })
      expect(group).toHaveAttribute('data-multiple')

      await user.click(button1)
      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'true')

      await user.click(button2)
      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await rerender({ multiple: false, inToolbar })
      expect(group).not.toHaveAttribute('data-multiple')

      await user.click(button2)
      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'true')

      await user.keyboard('[ArrowLeft]')
      expect(button1).toHaveFocus()
    })
  })

  describe('prop: disabled', () => {
    it('disabled group sets aria-disabled and data-disabled on all buttons', () => {
      render(BasicToggleGroup, { disabled: true })
      screen.getAllByRole('button').forEach((btn) => {
        expect(btn).toHaveAttribute('aria-disabled', 'true')
        expect(btn).toHaveAttribute('data-disabled')
      })
    })

    it('can disable individual items', () => {
      render(IndividualDisabledToggleGroup)
      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-disabled', 'false')
      expect(button1).not.toHaveAttribute('data-disabled')
      expect(button2).toHaveAttribute('aria-disabled', 'true')
      expect(button2).toHaveAttribute('data-disabled')
    })
  })

  describe('Toggles omitting value', () => {
    it('toggles independently when Toggles omit value in multiple mode', async () => {
      const user = userEvent.setup()
      render(OmitValueToggleGroup)
      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button1)
      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button2)
      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'true')

      await user.click(button1)
      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'true')
    })

    it('toggles independently when Toggles omit value in single mode', async () => {
      const user = userEvent.setup()
      render(OmitValueSingleToggleGroup)
      const [button1, button2] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button1)
      expect(button1).toHaveAttribute('aria-pressed', 'true')
      expect(button2).toHaveAttribute('aria-pressed', 'false')

      await user.click(button2)
      expect(button1).toHaveAttribute('aria-pressed', 'false')
      expect(button2).toHaveAttribute('aria-pressed', 'true')
    })

    it('warns if a Toggle value is not set and the ToggleGroup value is defined', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      render(MissingValueToggleGroup)
      expect(spy).toHaveBeenCalledExactlyOnceWith(
        'ShardsUI: A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop. ' +
          'This will cause issues between the Toggle Group and Toggle values. ' +
          'Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.'
      )
      spy.mockRestore()
    })

    it('does not warn about a Toggle mounted after an uncontrolled group wrote its own value', async () => {
      const user = userEvent.setup()
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { rerender } = render(LateToggleUncontrolledGroup)

      await user.click(screen.getAllByRole('button')[0])
      await rerender({ showLate: true })

      expect(screen.getAllByRole('button')).toHaveLength(2)
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('prop: onValueChange', () => {
    it('fires onValueChange with the new value array when a button is clicked', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(BasicToggleGroup, { onValueChange })
      const [btn1, btn2] = screen.getAllByRole('button')

      expect(onValueChange).not.toHaveBeenCalled()

      await user.click(btn1)

      expect(onValueChange).toHaveBeenCalledOnce()
      expect(onValueChange.mock.calls[0][0]).toEqual(['one'])

      await user.click(btn2)

      expect(onValueChange).toHaveBeenCalledTimes(2)
      expect(onValueChange.mock.calls[1][0]).toEqual(['two'])
    })

    it('does not change the value when the bound parent declines the write', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(DecliningToggleGroup, { onValueChange })
      const [btn1] = screen.getAllByRole('button')

      await user.click(btn1)

      expect(onValueChange).toHaveBeenCalledOnce()
      expect(btn1).toHaveAttribute('aria-pressed', 'false')
    })

    it.skipIf(isJSDOM).each(['Enter', 'Space'])('fires when %s is pressed', async (key) => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(BasicToggleGroup, { onValueChange })

      const [button1, button2] = screen.getAllByRole('button')

      expect(onValueChange).not.toHaveBeenCalled()

      button1.focus()
      await user.keyboard(`[${key}]`)

      expect(onValueChange).toHaveBeenCalledOnce()
      expect(onValueChange.mock.calls[0][0]).toEqual(['one'])

      button2.focus()
      await user.keyboard(`[${key}]`)

      expect(onValueChange).toHaveBeenCalledTimes(2)
      expect(onValueChange.mock.calls[1][0]).toEqual(['two'])
    })
  })

  describe('prop: orientation', () => {
    it('vertical orientation sets data-orientation=vertical', () => {
      render(BasicToggleGroup, { orientation: 'vertical' })
      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('data-orientation', 'vertical')
    })

    it('does not render aria-orientation on role="group"', () => {
      render(BasicToggleGroup, { orientation: 'horizontal' })
      const group = screen.getByRole('group')
      expect(group).not.toHaveAttribute('aria-orientation')
    })
  })

  describe.skipIf(isJSDOM)('keyboard interactions', () => {
    it('Home key moves focus to the first item', async () => {
      const user = userEvent.setup()
      render(BasicToggleGroup)
      const [button1, button2, button3] = screen.getAllByRole('button')

      await user.tab()
      expect(button1).toHaveFocus()

      await user.keyboard('{ArrowRight}{ArrowRight}')
      expect(button3).toHaveFocus()

      await user.keyboard('{Home}')
      expect(button1).toHaveAttribute('tabindex', '0')
      expect(button1).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expect(button2).toHaveFocus()

      await user.keyboard('{Home}')
      expect(button1).toHaveAttribute('tabindex', '0')
      expect(button1).toHaveFocus()
    })

    it('End key moves focus to the last item', async () => {
      const user = userEvent.setup()
      render(BasicToggleGroup)
      const [button1, button2, button3] = screen.getAllByRole('button')

      await user.tab()
      expect(button1).toHaveFocus()

      await user.keyboard('{End}')
      expect(button3).toHaveAttribute('tabindex', '0')
      expect(button3).toHaveFocus()

      await user.keyboard('{ArrowLeft}')
      expect(button2).toHaveFocus()

      await user.keyboard('{End}')
      expect(button3).toHaveAttribute('tabindex', '0')
      expect(button3).toHaveFocus()
    })

    it.each(['Enter', 'Space'])('key: %s toggles the pressed state', async (key) => {
      const user = userEvent.setup()
      render(BasicToggleGroup)
      const [button1] = screen.getAllByRole('button')

      expect(button1).toHaveAttribute('aria-pressed', 'false')

      button1.focus()
      await user.keyboard(`[${key}]`)
      expect(button1).toHaveAttribute('aria-pressed', 'true')

      await user.keyboard(`[${key}]`)
      expect(button1).toHaveAttribute('aria-pressed', 'false')
    })

    it.each([
      ['ltr', 'horizontal', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'],
      ['ltr', 'vertical', 'ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'],
      ['rtl', 'horizontal', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'],
      ['rtl', 'vertical', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']
    ] as const)(
      '%s > orientation: %s',
      async (direction, orientation, nextKey, prevKey, ignoredNextKey, ignoredPrevKey) => {
        const user = userEvent.setup()
        render(DirectionToggleGroup, { direction, orientation })

        const [button1, button2, button3] = screen.getAllByRole('button')

        await user.tab()

        expect(button1).toHaveAttribute('tabindex', '0')
        expect(button1).toHaveFocus()

        await user.keyboard(`{${nextKey}}`)

        expect(button2).toHaveAttribute('tabindex', '0')
        expect(button2).toHaveFocus()

        await user.keyboard(`{${nextKey}}`)

        expect(button3).toHaveAttribute('tabindex', '0')
        expect(button3).toHaveFocus()

        await user.keyboard(`{${nextKey}}`)

        expect(button1).toHaveAttribute('tabindex', '0')
        expect(button1).toHaveFocus()

        await user.keyboard(`{${prevKey}}`)

        expect(button3).toHaveAttribute('tabindex', '0')
        expect(button3).toHaveFocus()

        await user.keyboard(`{${prevKey}}`)

        expect(button2).toHaveAttribute('tabindex', '0')
        expect(button2).toHaveFocus()

        await user.keyboard(`{${ignoredNextKey}}`)

        expect(button2).toHaveAttribute('tabindex', '0')
        expect(button2).toHaveFocus()

        await user.keyboard(`{${ignoredPrevKey}}`)

        expect(button2).toHaveAttribute('tabindex', '0')
        expect(button2).toHaveFocus()
      }
    )
  })
})
