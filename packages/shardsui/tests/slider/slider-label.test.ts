import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import BasicSlider from './fixtures/basic-slider.svelte'
import FieldLabeledSlider from './fixtures/field-labeled-slider.svelte'
import LabeledSlider from './fixtures/labeled-slider.svelte'

describe('<Slider.Label />', () => {
  it('aria-labelledby points the slider input at the rendered Slider.Label', () => {
    render(LabeledSlider, { value: 30 })
    const label = screen.getByTestId('label')
    expect(screen.getByRole('slider')).toHaveAttribute('aria-labelledby', label.id)
  })

  it('clicking the label focuses the slider input', async () => {
    const user = userEvent.setup()
    render(LabeledSlider, { value: 30 })
    await user.click(screen.getByTestId('label'))
    expect(screen.getByRole('slider')).toHaveFocus()
  })

  it('clicking the label does not focus a thumb for range sliders', async () => {
    const user = userEvent.setup()
    render(LabeledSlider, { value: [20, 80], label: 'Price range' })
    await user.click(screen.getByTestId('label'))
    const [minimumSlider, maximumSlider] = screen.getAllByRole('slider')
    expect(minimumSlider).not.toHaveFocus()
    expect(maximumSlider).not.toHaveFocus()
  })

  it('focuses the registered thumb when composed within a Field', async () => {
    const user = userEvent.setup()
    render(FieldLabeledSlider, { value: 50 })

    await user.click(screen.getByTestId('label'))

    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveFocus()
    expect(screen.getByRole('slider', { name: 'Unrelated range' })).not.toHaveFocus()
  })

  it('does nothing when a Field slider has no thumb to focus', async () => {
    const user = userEvent.setup()
    render(FieldLabeledSlider, { value: 50, showThumb: false })

    await user.click(screen.getByTestId('label'))

    expect(document.body).toHaveFocus()
  })

  it('does not set aria-labelledby on thumbs when aria-label is provided', () => {
    render(LabeledSlider, { value: [20, 80], useAriaLabel: true })
    const [minimumSlider, maximumSlider] = screen.getAllByRole('slider')
    expect(minimumSlider).toHaveAttribute('aria-label', 'Minimum price')
    expect(maximumSlider).toHaveAttribute('aria-label', 'Maximum price')
    expect(minimumSlider).not.toHaveAttribute('aria-labelledby')
    expect(maximumSlider).not.toHaveAttribute('aria-labelledby')
  })

  it('does not set fallback aria-labelledby when no label is rendered', async () => {
    render(BasicSlider, { value: 50 })
    await waitFor(() => {
      expect(screen.getByRole('slider')).not.toHaveAttribute('aria-labelledby')
    })
  })

  describe('linkage', () => {
    it('updates linkage when the root id changes', async () => {
      const { rerender } = render(LabeledSlider, { id: 'first', value: 30 })

      await rerender({ id: 'second', value: 30 })

      await waitFor(() => {
        expect(screen.getByTestId('root')).toHaveAttribute('id', 'second')
      })
      const label = screen.getByTestId('label')
      const root = screen.getByTestId('root')
      const slider = screen.getByRole('slider')
      expect(label.id).toBe('second-label')
      expect(root).toHaveAttribute('aria-labelledby', label.id)
      expect(slider).toHaveAttribute('aria-labelledby', label.id)
    })
  })
})
