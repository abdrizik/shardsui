import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import AutocompleteValueFixture from './fixtures/autocomplete-value-fixture.svelte'

describe('<Autocomplete.Value />', () => {
  describe('prop: children', () => {
    it('renders current input value via function child', () => {
      render(AutocompleteValueFixture, { value: 'hel', variant: 'function' })
      expect(screen.getByTestId('value')).toHaveTextContent('hel')
    })

    it('renders function child with empty string when no value typed', () => {
      render(AutocompleteValueFixture, { value: '', variant: 'function' })
      expect(screen.getByTestId('value')).toHaveTextContent('empty')
    })

    it('overrides the display when children ignores the value', () => {
      render(AutocompleteValueFixture, { value: 'test-value', variant: 'static' })
      expect(screen.getByText('Custom Display Text')).toBeInTheDocument()
    })

    it('renders complex children', () => {
      render(AutocompleteValueFixture, { value: 'test', variant: 'complex' })
      const element = screen.getByTestId('complex')
      expect(element.querySelector('strong')).toHaveTextContent('Bold')
      expect(element.querySelector('em')).toHaveTextContent('italic')
    })
  })
})
