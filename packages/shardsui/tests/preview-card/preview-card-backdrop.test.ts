import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import ElementTypes from './fixtures/element-types.svelte'
import PreviewCardWithBackdrop from './fixtures/preview-card-with-backdrop.svelte'

describe('<PreviewCard.Backdrop />', () => {
  it('renders a custom as element', () => {
    render(ElementTypes, { backdropAs: 'span' })
    expect(screen.getByTestId('backdrop').tagName.toLowerCase()).toBe('span')
  })

  it('sets `pointer-events: none` style', async () => {
    render(PreviewCardWithBackdrop, { open: false, delay: 0, closeDelay: 0 })

    const trigger = screen.getByTestId('trigger')
    fireEvent.pointerDown(trigger, { pointerType: 'mouse' })
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    fireEvent.mouseEnter(trigger)

    await waitFor(() => expect(screen.getByTestId('backdrop').style.pointerEvents).toBe('none'))
  })
})
