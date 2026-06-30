import { Toolbar } from '$lib/components/toolbar'
import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import ToolbarSeparator from './fixtures/toolbar-separator.svelte'

describe('<Toolbar.Separator />', () => {
  it.each([
    ['horizontal', 'vertical'],
    ['vertical', 'horizontal']
  ] as const)('uses a %s separator in a %s toolbar', (separatorOrientation, toolbarOrientation) => {
    render(ToolbarSeparator, { orientation: toolbarOrientation })

    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', separatorOrientation)
  })

  it('allows its orientation to be overridden', () => {
    render(ToolbarSeparator, { orientation: 'horizontal', separatorOrientation: 'horizontal' })

    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('throws a descriptive error when rendered outside <Toolbar.Root>', () => {
    expect(() => render(Toolbar.Separator)).toThrow(
      'ShardsUI: this part must be rendered inside <Toolbar.Root>.'
    )
  })
})
