import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import AnimationPanelAccordion from './fixtures/animation-panel-accordion.svelte'
import AsAccordion from './fixtures/as-accordion.svelte'
import HiddenUntilFoundOverrideAccordion from './fixtures/hidden-until-found-override-accordion.svelte'
import KeepMountedAccordion from './fixtures/keep-mounted-accordion.svelte'
import TransitionAccordion from './fixtures/transition-accordion.svelte'

const PANEL_CONTENT_1 = 'Panel 1'

describe('<Accordion.Panel />', () => {
  describe('prop: as', () => {
    it('renders a custom element', () => {
      render(AsAccordion, { panelAs: 'section' })

      expect(screen.getByTestId('panel').tagName.toLowerCase()).toBe('section')
    })
  })

  describe('animations', () => {
    it('suppresses the initial keyframe animation from inline styles when rendered open', () => {
      render(AnimationPanelAccordion, { value: ['one'] })

      const panel = screen.getByTestId('panel')
      expect(panel.style.animationName).toBe('none')
      expect(panel.style.animationDuration).toBe('100ms')
    })
  })

  it('passes root keepMounted to closed panels — closed panel has the `hidden` attribute', () => {
    render(KeepMountedAccordion, { value: [] })

    const panel = screen.getByText(PANEL_CONTENT_1)

    expect(panel).toBeInTheDocument()
    expect(panel).not.toHaveAttribute('data-open')
    expect(panel).toHaveAttribute('data-closed')
    expect(panel).toHaveAttribute('hidden')
  })

  it('passes root hiddenUntilFound to closed panels and allows panel overrides', async () => {
    render(HiddenUntilFoundOverrideAccordion)

    await waitFor(() =>
      expect(screen.getByText('Panel contents 1').getAttribute('hidden')).toBe('until-found')
    )
    expect(screen.queryByText('Overridden panel')).toBe(null)
  })
  describe.skipIf(isJSDOM)('CSS transitions', () => {
    it('closing panel stays visible until its exit transition completes when switching items', async () => {
      const user = userEvent.setup()
      render(TransitionAccordion)

      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      const panel1 = screen.getByTestId('panel-1')
      const panel2 = screen.getByTestId('panel-2')

      await waitFor(() => expect(panel1).toHaveAttribute('data-open'))
      expect(panel1.style.getPropertyValue('--accordion-panel-height')).toBe('auto')

      await user.click(trigger2)

      await waitFor(() => expect(panel1).toHaveAttribute('data-ending-style'))
      expect(panel1).not.toHaveAttribute('hidden')
      expect(panel1.style.getPropertyValue('--accordion-panel-height')).toMatch(/px$/)
      expect(panel2).toHaveAttribute('data-open')

      await waitFor(() => expect(panel1).toHaveAttribute('hidden'))
      expect(panel2).not.toHaveAttribute('hidden')
    })
  })
})
