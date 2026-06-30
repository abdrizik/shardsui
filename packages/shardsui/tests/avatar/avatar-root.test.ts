import { Avatar } from '$lib/components/avatar'
import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'

describe('<Avatar.Root />', () => {
  it('renders a span', () => {
    const { container } = render(Avatar.Root)

    expect(container.firstElementChild?.tagName).toBe('SPAN')
  })

  it('forwards extra props to the element', () => {
    render(Avatar.Root, { class: 'my-avatar', style: 'opacity: 0.5;', 'data-testid': 'root' })
    const root = screen.getByTestId('root')

    expect(root).toHaveClass('my-avatar')
    expect(root).toHaveStyle('opacity: 0.5')
  })

  it('renders the element specified by the as prop', () => {
    const { container } = render(Avatar.Root, { as: 'div' })

    expect(container.firstElementChild?.tagName).toBe('DIV')
  })
})
