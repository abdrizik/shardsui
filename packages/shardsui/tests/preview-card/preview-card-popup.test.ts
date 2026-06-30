import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicPreviewCard from './fixtures/basic-preview-card.svelte'
import ElementTypes from './fixtures/element-types.svelte'
import PreviewCardPopupOutsidePositioner from './fixtures/preview-card-popup-outside-positioner.svelte'
import PreviewCardPopupOutsideRoot from './fixtures/preview-card-popup-outside-root.svelte'

describe('<PreviewCard.Popup />', () => {
  it('throws a descriptive error when rendered outside <PreviewCard.Root>', () => {
    expect(() => render(PreviewCardPopupOutsideRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <PreviewCard.Root>.'
    )
  })

  it('throws a descriptive error when rendered outside <PreviewCard.Positioner>', () => {
    expect(() => render(PreviewCardPopupOutsidePositioner)).toThrow(
      'ShardsUI: this part must be rendered inside <PreviewCard.Positioner>.'
    )
  })

  it('renders the children', () => {
    render(BasicPreviewCard, { open: true })
    expect(screen.getByText('Card content')).not.toBeNull()
  })

  it('renders a custom as element', () => {
    render(ElementTypes, { popupAs: 'section' })
    expect(screen.getByTestId('popup').tagName.toLowerCase()).toBe('section')
  })
})
