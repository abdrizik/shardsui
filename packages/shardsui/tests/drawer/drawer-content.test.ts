import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import DrawerWithContent from './fixtures/drawer-with-content.svelte'

describe('<Drawer.Content />', () => {
  it('does not add a public swipe-ignore attribute', () => {
    render(DrawerWithContent)
    const content = screen.getByTestId('content')
    expect(content).not.toHaveAttribute('data-shards-ui-swipe-ignore')
  })
})
