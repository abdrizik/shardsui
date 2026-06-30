import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import ElementTypes from './fixtures/element-types.svelte'

describe('<PreviewCard.Arrow />', () => {
  it('renders a custom as element', () => {
    render(ElementTypes, { arrowAs: 'span' })
    expect(screen.getByTestId('arrow').tagName.toLowerCase()).toBe('span')
  })
})
