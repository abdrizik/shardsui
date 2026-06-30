import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import ValueChildrenCombobox from './fixtures/value-children-combobox.svelte'
import ValueCombobox from './fixtures/value-combobox.svelte'
import ValueComplexChildren from './fixtures/value-complex-children.svelte'
import ValueDisplayCombobox from './fixtures/value-display-combobox.svelte'
import ValueObjects from './fixtures/value-objects.svelte'
import ValueStaleItems from './fixtures/value-stale-items.svelte'
import ValueStaticChildren from './fixtures/value-static-children.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.Value />', () => {
  it('renders placeholder when no value is selected', () => {
    render(ValueCombobox, { placeholder: 'Select an option' })
    const trigger = screen.getByTestId('trigger')
    expect(trigger).toHaveTextContent('Select an option')
  })

  it('does not display placeholder when value is selected', () => {
    render(ValueCombobox, { value: 'apple', placeholder: 'Select an option' })
    const trigger = screen.getByTestId('trigger')
    expect(trigger).not.toHaveTextContent('Select an option')
  })

  describe('selected value with label property', () => {
    it('renders label from selected value object', () => {
      const valueWithLabel = { value: 'test', label: 'Test Label' }
      render(ValueDisplayCombobox, { value: valueWithLabel })
      expect(screen.getByTestId('value')).toHaveTextContent('Test Label')
    })

    it('handles selected value with null label (falls back to value)', () => {
      const valueWithNullLabel = { value: 'test', label: null }
      render(ValueDisplayCombobox, { value: valueWithNullLabel })
      expect(screen.getByTestId('value')).toHaveTextContent('test')
    })
  })

  describe('items array format', () => {
    const items = [
      { value: 'sans', label: 'Sans-serif' },
      { value: 'serif', label: 'Serif' },
      { value: 'mono', label: 'Monospace' }
    ]

    it('displays the label from items array when value is selected', () => {
      render(ValueObjects, { value: items[1], items })
      expect(screen.getByTestId('value')).toHaveTextContent('Serif')
    })

    it('renders null item label from items array when no value is selected', () => {
      const nullItems = [
        { value: null, label: 'Select item' },
        { value: 'a', label: 'A' }
      ]
      render(ValueObjects, { items: nullItems })
      expect(screen.getByTestId('value')).toHaveTextContent('Select item')
    })

    it('handles duplicate values in items array (uses first match)', () => {
      const dupItems = [
        { value: 'test', label: 'First Label' },
        { value: 'test', label: 'Second Label' },
        { value: 'other', label: 'Other' }
      ]
      render(ValueObjects, { value: dupItems[0], items: dupItems })
      expect(screen.getByTestId('value')).toHaveTextContent('First Label')
    })

    it('renders the null item label when the input is inside the popup and no value is set', () => {
      const nullItems = [
        { value: null, label: 'Select country' },
        { value: 'united-kingdom', label: 'United Kingdom' }
      ]
      render(ValueObjects, { items: nullItems, inputInsidePopup: true })
      expect(screen.getByTestId('value')).toHaveTextContent('Select country')
    })

    it('is not stale after items are updated', async () => {
      const user = userEvent.setup()
      render(ValueStaleItems)

      expect(screen.getByTestId('value')).toHaveTextContent('a')

      await user.click(screen.getByRole('button', { name: 'update' }))
      expect(screen.getByTestId('value')).toHaveTextContent('a new')

      await user.click(screen.getByRole('button', { name: 'select c' }))
      expect(screen.getByTestId('value')).toHaveTextContent('c')
    })

    it('updates the label when value changes with items array', async () => {
      const { rerender } = render(ValueObjects, { value: items[0], items })
      expect(screen.getByTestId('value')).toHaveTextContent('Sans-serif')
      await rerender({ value: items[1], items })
      expect(screen.getByTestId('value')).toHaveTextContent('Serif')
      await rerender({ value: items[2], items })
      expect(screen.getByTestId('value')).toHaveTextContent('Monospace')
      await rerender({ value: null, items })
      expect(screen.getByTestId('value')).toHaveTextContent('')
    })
  })

  describe('grouped items', () => {
    it('handles grouped items correctly', () => {
      const groups = [
        {
          value: 'fonts',
          items: [
            { value: 'sans', label: 'Sans-serif' },
            { value: 'serif', label: 'Serif' }
          ]
        },
        {
          value: 'sizes',
          items: [
            { value: 'small', label: 'Small' },
            { value: 'large', label: 'Large' }
          ]
        }
      ]
      render(ValueObjects, { value: groups[0].items[1], items: groups, grouped: true })
      expect(screen.getByTestId('value')).toHaveTextContent('Serif')
    })

    it('handles null items in grouped structure', () => {
      const groups = [
        {
          value: 'options',
          items: [
            { value: null, label: 'None selected' },
            { value: 'option1', label: 'Option 1' }
          ]
        }
      ]
      render(ValueObjects, { items: groups, grouped: true })
      expect(screen.getByTestId('value')).toHaveTextContent('None selected')
    })
  })

  describe('multiple selection', () => {
    const items = [
      { value: 'sans', label: 'Sans-serif' },
      { value: 'serif', label: 'Serif' },
      { value: 'mono', label: 'Monospace' }
    ]

    it('displays comma-separated labels from items array', () => {
      render(ValueObjects, {
        value: [items[0], items[1]],
        items,
        multiple: true,
        itemToStringLabel: (item: unknown) => (item as { label: string }).label
      })
      expect(screen.getByTestId('value')).toHaveTextContent('Sans-serif, Serif')
    })

    it('resolves primitive selected values against the items array', () => {
      render(ValueObjects, { value: ['serif', 'mono'], items, multiple: true })
      expect(screen.getByTestId('value')).toHaveTextContent('Serif, Monospace')
    })

    it('displays comma-separated labels for multiple selection', () => {
      render(ValueCombobox, { multiple: true, value: ['apple', 'banana'] })
      expect(screen.getByTestId('trigger')).toHaveTextContent('apple, banana')
    })
  })

  describe('prop: itemToStringLabel', () => {
    it('uses custom itemToStringLabel function', () => {
      const complexItem = { id: 1, name: 'Test Item' }
      render(ValueObjects, {
        value: complexItem,
        items: [complexItem],
        itemToStringLabel: (item: unknown) => `Custom: ${(item as { name: string }).name}`
      })
      expect(screen.getByTestId('value')).toHaveTextContent('Custom: Test Item')
    })
  })

  describe('placeholder precedence', () => {
    it('null item label in items takes precedence over placeholder', () => {
      const items = [
        { value: null, label: 'None' },
        { value: 'option1', label: 'Option 1' }
      ]
      render(ValueObjects, { items, placeholder: 'Select an option' })
      expect(screen.getByTestId('value')).toHaveTextContent('None')
    })

    it('uses placeholder when items have null value without label', () => {
      const items = [
        { value: null, label: null },
        { value: 'option1', label: 'Option 1' }
      ]
      render(ValueObjects, { items, placeholder: 'Select an option' })
      expect(screen.getByTestId('value')).toHaveTextContent('Select an option')
    })

    it('displays placeholder when multiple mode has empty array', () => {
      render(ValueCombobox, { value: [], multiple: true, placeholder: 'Select options' })
      expect(screen.getByTestId('trigger')).toHaveTextContent('Select options')
    })
  })

  describe('function child', () => {
    it('renders current selected value via function child', () => {
      render(ValueChildrenCombobox, { value: 'apple' })
      expect(screen.getByTestId('value-children')).toHaveTextContent('"apple"')
    })

    it('renders function child with null when no value selected', () => {
      render(ValueChildrenCombobox, {})
      expect(screen.getByTestId('value-children')).toHaveTextContent('NONE')
    })

    it('children snippet takes precedence over placeholder', () => {
      render(ValueChildrenCombobox, { placeholder: 'Select…' })
      expect(screen.getByTestId('value-children')).toBeInTheDocument()
      expect(screen.getByTestId('trigger')).not.toHaveTextContent('Select…')
    })

    it('renders the children snippet with complex objects', () => {
      const complexValue = { id: 1, name: 'Test', nested: { data: 'value' } }
      render(ValueComplexChildren, { value: complexValue })
      expect(screen.getByTestId('value')).toHaveTextContent('Test (1)')
    })

    it('overrides the value display when children is static content', () => {
      render(ValueStaticChildren, { value: 'test-value' })
      expect(screen.getByText('Custom Display Text')).toBeInTheDocument()
    })

    it('static children take precedence over placeholder', () => {
      render(ValueStaticChildren, { value: null, placeholder: 'Select an option' })
      expect(screen.getByText('Custom Display Text')).toBeInTheDocument()
      expect(screen.queryByText('Select an option')).toBe(null)
    })

    it('renders complex static children', () => {
      render(ValueStaticChildren, { value: 'test', complex: true })
      const element = screen.getByTestId('complex')
      expect(element.querySelector('strong')).toHaveTextContent('Bold')
      expect(element.querySelector('em')).toHaveTextContent('italic')
    })
  })

  describe('value type display', () => {
    it('handles string values correctly', () => {
      render(ValueDisplayCombobox, { value: 'test-string' })
      expect(screen.getByTestId('value')).toHaveTextContent('test-string')
    })

    it('handles number values correctly', () => {
      render(ValueDisplayCombobox, { value: 42 })
      expect(screen.getByTestId('value')).toHaveTextContent('42')
    })

    it('handles boolean values correctly', () => {
      render(ValueDisplayCombobox, { value: true })
      expect(screen.getByTestId('value')).toHaveTextContent('true')
    })
  })
})
