import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import ElementTypes from './fixtures/element-types.svelte'
import PreviewCardTriggerWithoutRoot from './fixtures/preview-card-trigger-without-root.svelte'

describe('<PreviewCard.Trigger />', () => {
  it('throws a descriptive error when rendered without a root or a handle', () => {
    expect(() => render(PreviewCardTriggerWithoutRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <PreviewCard.Root>.'
    )
  })

  it('renders a custom as element', () => {
    render(ElementTypes, { triggerAs: 'button' })
    expect(screen.getByTestId('trigger').tagName.toLowerCase()).toBe('button')
  })
})
