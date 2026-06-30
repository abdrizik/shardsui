import { Toast } from '$lib/components/toast'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import AnchoredPositionerToast from './fixtures/anchored-positioner-toast.svelte'

describe('<Toast.Arrow />', () => {
  it.skipIf(isJSDOM)('mirrors the resolved side of its positioner', async () => {
    render(AnchoredPositionerToast)

    fireEvent.click(screen.getByRole('button', { name: 'anchor' }))

    const arrow = await screen.findByTestId('arrow')
    await waitFor(() => expect(arrow).toHaveAttribute('data-side', 'bottom'))
    expect(arrow).toHaveAttribute('aria-hidden', 'true')
  })

  it('throws a descriptive error when rendered outside <Toast.Positioner>', () => {
    expect(() => render(Toast.Arrow)).toThrow(
      'ShardsUI: this part must be rendered inside <Toast.Positioner>.'
    )
  })
})
