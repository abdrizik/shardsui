import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import CompositeFixture from './fixtures/composite-fixture.svelte'

describe('Composite', () => {
  describe('vertical navigation (default)', () => {
    it('ArrowDown moves focus to the next item', async () => {
      render(CompositeFixture)
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => {
        expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0')
        expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '-1')
      })
    })

    it('ArrowUp moves focus to the previous item', async () => {
      render(CompositeFixture)
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0'))
      fireEvent.keyDown(root, { key: 'ArrowUp' })
      await waitFor(() => expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '0'))
    })

    it('loops to last item on ArrowUp from first when loopFocus=true', async () => {
      render(CompositeFixture, { loopFocus: true })
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowUp' })
      await waitFor(() => {
        expect(screen.getByTestId('3')).toHaveAttribute('tabindex', '0')
        expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '-1')
      })
    })

    it('stays at last item on ArrowDown from last when loopFocus=false', async () => {
      render(CompositeFixture, { loopFocus: false })
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0'))
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => expect(screen.getByTestId('3')).toHaveAttribute('tabindex', '0'))
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => {
        expect(screen.getByTestId('3')).toHaveAttribute('tabindex', '0')
        expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '-1')
      })
    })

    it('loops to first item on ArrowDown from last when loopFocus=true', async () => {
      render(CompositeFixture, { loopFocus: true })
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0'))
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => expect(screen.getByTestId('3')).toHaveAttribute('tabindex', '0'))
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '0'))
    })

    it('skips disabled items when navigating', async () => {
      render(CompositeFixture, {
        items: [{ label: '1' }, { label: '2', disabled: true }, { label: '3' }]
      })
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => {
        expect(screen.getByTestId('3')).toHaveAttribute('tabindex', '0')
        expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '-1')
      })
    })
  })

  describe('initial tab stop', () => {
    it('moves the initial tab stop to the first enabled item when the default item is disabled', async () => {
      render(CompositeFixture, {
        items: [{ label: '1', disabled: true }, { label: '2' }, { label: '3' }]
      })

      await waitFor(() => expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0'))
      expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '-1')
      expect(screen.getByTestId('3')).toHaveAttribute('tabindex', '-1')
    })

    it('keeps the initial tab stop when all items are disabled', async () => {
      render(CompositeFixture, {
        items: [
          { label: '1', disabled: true },
          { label: '2', disabled: true }
        ]
      })

      await waitFor(() => expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '0'))
      expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('document order', () => {
    it('re-indexes items when one moves outside of Svelte', async () => {
      render(CompositeFixture)
      const root = screen.getByTestId('root')
      const first = screen.getByTestId('1')

      await waitFor(() => expect(first).toHaveAttribute('tabindex', '0'))

      root.appendChild(first)

      await waitFor(() => expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0'))
      expect(first).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('item registration', () => {
    it('drops registrations for items that unmount', async () => {
      const { rerender } = render(CompositeFixture, {
        items: [{ label: '1' }, { label: '2' }, { label: '3' }]
      })
      const root = screen.getByTestId('root')

      await rerender({ items: [{ label: '1' }] })

      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '0'))
      expect(screen.queryByTestId('2')).toBeNull()
      expect(screen.queryByTestId('3')).toBeNull()
    })

    it.skipIf(isJSDOM)('updates the order of items', async () => {
      const { rerender } = render(CompositeFixture, {
        items: [{ label: '1' }, { label: '2' }, { label: '3' }]
      })
      await rerender({ items: [{ label: '1' }, { label: '3' }, { label: '2' }] })

      const item1 = screen.getByTestId('1')
      item1.focus()

      fireEvent.keyDown(item1, { key: 'ArrowDown' })
      await waitFor(() => expect(screen.getByTestId('3')).toHaveFocus())
    })
  })

  describe('native input', () => {
    it('keeps native input behavior when the input is the event target', async () => {
      render(CompositeFixture, {
        orientation: 'horizontal',
        nativeInput: true,
        items: [{ label: '1' }, { label: '2' }]
      })

      const input = screen.getByTestId('native-input') as HTMLInputElement
      input.focus()

      await waitFor(() => {
        expect(input.selectionStart).toBe(0)
        expect(input.selectionEnd).toBe(4)
      })

      const item1 = screen.getByTestId('1')
      item1.focus()

      input.setSelectionRange(1, 1)
      fireEvent.keyDown(input, { key: 'ArrowRight' })

      expect(item1).toHaveFocus()
      expect(screen.getByTestId('2')).not.toHaveFocus()
    })
  })

  describe('Home/End keys', () => {
    it('Home moves to first enabled item when enableHomeAndEnd=true', async () => {
      render(CompositeFixture, { enableHomeAndEnd: true })
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0'))
      fireEvent.keyDown(root, { key: 'ArrowDown' })
      await waitFor(() => expect(screen.getByTestId('3')).toHaveAttribute('tabindex', '0'))
      fireEvent.keyDown(root, { key: 'Home' })
      await waitFor(() => expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '0'))
    })

    it('End moves to last enabled item when enableHomeAndEnd=true', async () => {
      render(CompositeFixture, { enableHomeAndEnd: true })
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'End' })
      await waitFor(() => {
        expect(screen.getByTestId('3')).toHaveAttribute('tabindex', '0')
        expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '-1')
      })
    })
  })

  describe('modifierKeys', () => {
    it('prevents arrow key navigation when any modifier key is pressed by default', async () => {
      render(CompositeFixture)
      const root = screen.getByTestId('root')

      for (const modifier of ['shiftKey', 'ctrlKey', 'altKey', 'metaKey'] as const) {
        fireEvent.keyDown(root, { key: 'ArrowDown', [modifier]: true })
        await waitFor(() => expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '0'))
        expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '-1')
      }
    })

    it('ctrl+ArrowDown moves focus when Control is in modifierKeys allow-list', async () => {
      render(CompositeFixture, { modifierKeys: ['Control'] })
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowDown', ctrlKey: true })
      await waitFor(() => expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0'))
    })

    it('shift+ArrowDown moves focus when Shift is in modifierKeys allow-list', async () => {
      render(CompositeFixture, { modifierKeys: ['Shift'] })
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowDown', shiftKey: true })
      await waitFor(() => expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0'))
    })
  })

  describe.skipIf(isJSDOM)('rtl orientation', () => {
    it('ArrowLeft moves forward in RTL', async () => {
      render(CompositeFixture, { orientation: 'horizontal', rtl: true })
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowLeft' })
      await waitFor(() => expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0'))
    })

    it('ArrowRight moves backward in RTL', async () => {
      render(CompositeFixture, { orientation: 'horizontal', rtl: true })
      const root = screen.getByTestId('root')
      fireEvent.keyDown(root, { key: 'ArrowLeft' })
      await waitFor(() => expect(screen.getByTestId('2')).toHaveAttribute('tabindex', '0'))
      fireEvent.keyDown(root, { key: 'ArrowRight' })
      await waitFor(() => expect(screen.getByTestId('1')).toHaveAttribute('tabindex', '0'))
    })

    it('both horizontal and vertical orientation', async () => {
      render(CompositeFixture, { orientation: 'both', rtl: true })
      const item1 = screen.getByTestId('1')
      const item2 = screen.getByTestId('2')
      const item3 = screen.getByTestId('3')

      item1.focus()

      fireEvent.keyDown(item1, { key: 'ArrowLeft' })
      await waitFor(() => {
        expect(item2).toHaveAttribute('tabindex', '0')
        expect(item2).toHaveFocus()
      })

      fireEvent.keyDown(item2, { key: 'ArrowLeft' })
      await waitFor(() => {
        expect(item3).toHaveAttribute('tabindex', '0')
        expect(item3).toHaveFocus()
      })

      fireEvent.keyDown(item3, { key: 'ArrowRight' })
      await waitFor(() => {
        expect(item2).toHaveAttribute('tabindex', '0')
        expect(item2).toHaveFocus()
      })

      fireEvent.keyDown(item2, { key: 'ArrowRight' })
      await waitFor(() => {
        expect(item1).toHaveAttribute('tabindex', '0')
        expect(item1).toHaveFocus()
      })

      fireEvent.keyDown(item1, { key: 'ArrowDown' })
      await waitFor(() => {
        expect(item2).toHaveAttribute('tabindex', '0')
        expect(item2).toHaveFocus()
      })

      fireEvent.keyDown(item2, { key: 'ArrowDown' })
      await waitFor(() => {
        expect(item3).toHaveAttribute('tabindex', '0')
        expect(item3).toHaveFocus()
      })
    })
  })
})
