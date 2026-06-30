import { render, screen, waitFor } from '@testing-library/svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import TooltipArrow from './fixtures/tooltip-arrow.svelte'

describe('<Tooltip.Arrow />', () => {
  it('is hidden from assistive technology and mirrors the resolved side', async () => {
    render(TooltipArrow)

    const arrow = screen.getByTestId('arrow')

    expect(arrow).toHaveAttribute('aria-hidden', 'true')
    expect(arrow).toHaveAttribute('data-side', 'bottom')
    expect(arrow).toHaveAttribute('data-open')
  })

  it.skipIf(isJSDOM)('is marked uncentered when it cannot point at the anchor', async () => {
    render(TooltipArrow, { arrowPadding: 40 })

    await waitFor(() => {
      expect(screen.getByTestId('arrow')).toHaveAttribute('data-uncentered')
    })
  })

  it.skipIf(isJSDOM)('is not marked uncentered when it can point at the anchor', async () => {
    render(TooltipArrow, { arrowPadding: 0, triggerWidth: 200 })

    await waitFor(() => {
      expect(screen.getByTestId('arrow')).toHaveAttribute('data-side', 'bottom')
    })
    expect(screen.getByTestId('arrow')).not.toHaveAttribute('data-uncentered')
  })
})
