import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import ToolbarWithLink from './fixtures/toolbar-with-link.svelte'

describe('<Toolbar.Link />', () => {
  it('renders an anchor', () => {
    render(ToolbarWithLink)
    expect(screen.getByTestId('link-1')).toBe(screen.getByRole('link'))
  })
})
