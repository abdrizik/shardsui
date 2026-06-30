import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import SwitchThumbProps from './fixtures/switch-thumb-props.svelte'
import ThumbOutsideRoot from './fixtures/thumb-outside-root.svelte'

describe('<Switch.Thumb />', () => {
  it('throws a descriptive error when rendered outside <Switch.Root>', () => {
    expect(() => render(ThumbOutsideRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <Switch.Root>.'
    )
  })

  describe('prop: as', () => {
    it('renders the given tag', () => {
      render(SwitchThumbProps, { as: 'div' })
      expect(screen.getByTestId('thumb').tagName).toBe('DIV')
    })
  })

  describe('extra props', () => {
    it('spreads extra props', () => {
      render(SwitchThumbProps, { 'data-extra-prop': 'Lorem ipsum' })
      expect(screen.getByTestId('thumb')).toHaveAttribute('data-extra-prop', 'Lorem ipsum')
    })
  })
})
