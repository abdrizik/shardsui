import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { flushSync } from 'svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AsCollapsible from './fixtures/as-collapsible.svelte'
import ControlledCollapsible from './fixtures/controlled-collapsible.svelte'
import DecliningBeforeMatchCollapsible from './fixtures/declining-before-match-collapsible.svelte'
import DeferredMotionCollapsible from './fixtures/deferred-motion-collapsible.svelte'
import HiddenUntilFoundCollapsible from './fixtures/hidden-until-found-collapsible.svelte'
import StyledCollapsible from './fixtures/styled-collapsible.svelte'

function fireBeforeMatch(element: Element) {
  fireEvent(element, new window.Event('beforematch', { bubbles: true, cancelable: false }))
}

function waitForAnimationFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

function flushMicrotasks() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0)
  })
}

describe('<Collapsible.Panel />', () => {
  describe('prop: as', () => {
    it('renders a custom element', () => {
      render(AsCollapsible, { panelAs: 'section' })

      expect(screen.getByTestId('panel').tagName.toLowerCase()).toBe('section')
    })
  })

  describe('prop: keepMounted', () => {
    it('does not unmount the panel when true', async () => {
      render(ControlledCollapsible, { keepMounted: true })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const panel = screen.getByTestId('panel')

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(panel).not.toBeVisible()
      expect(panel).toHaveAttribute('data-closed')

      await fireEvent.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(trigger.getAttribute('aria-controls')).toBe(panel.getAttribute('id'))
      expect(trigger).toHaveAttribute('data-panel-open')
      expect(panel).toBeVisible()
      expect(panel).toHaveAttribute('data-open')

      await fireEvent.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger.getAttribute('aria-controls')).toBe(null)
      expect(panel).not.toBeVisible()
      expect(panel).toHaveAttribute('data-closed')
    })

    it.skipIf(isJSDOM)(
      'hides the panel after external controlled close when true and no animations are applied',
      async () => {
        const user = userEvent.setup()
        render(ControlledCollapsible, { keepMounted: true })

        const trigger = screen.getByRole('button', { name: 'Trigger' })
        const externalTrigger = screen.getByRole('button', { name: 'toggle externally' })
        const panel = screen.getByTestId('panel')

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(panel).toHaveAttribute('hidden')
        expect(panel).toHaveAttribute('data-closed')
        expect(panel).not.toHaveAttribute('data-ending-style')

        await user.click(externalTrigger)

        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(panel).not.toHaveAttribute('hidden')
        expect(panel).toHaveAttribute('data-open')

        await user.click(externalTrigger)

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(panel).toHaveAttribute('hidden')
        expect(panel).toHaveAttribute('data-closed')
        expect(panel).not.toHaveAttribute('data-ending-style')
      }
    )
  })

  describe.skipIf(isJSDOM)('CSS transitions', () => {
    it('applies data-starting-style while opening', async () => {
      render(StyledCollapsible, {
        panelClass: 'transition-test-panel',
        css: `
          .transition-test-panel {
            overflow: hidden;
            height: var(--collapsible-panel-height);
            transition: height 100ms linear;
          }
          .transition-test-panel[data-starting-style],
          .transition-test-panel[data-ending-style] { height: 0; }
        `
      })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      fireEvent.click(trigger)
      flushSync()

      const panel = screen.getByTestId('panel')
      expect(panel).toHaveAttribute('data-starting-style')
      expect(panel).toHaveAttribute('data-open')
    })

    it('restores a measured height before applying closing transition styles', async () => {
      const user = userEvent.setup()
      render(StyledCollapsible, {
        open: true,
        panelClass: 'transition-test-panel',
        css: `
          .transition-test-panel {
            overflow: hidden;
            height: var(--collapsible-panel-height);
            transition: height 100ms linear;
          }
          .transition-test-panel[data-ending-style] { height: 0; }
        `
      })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const panel = screen.getByTestId('panel')

      await waitFor(() =>
        expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('auto')
      )

      await user.click(trigger)

      await waitFor(() => expect(panel).toHaveAttribute('data-ending-style'))
      await waitFor(() =>
        expect(panel.style.getPropertyValue('--collapsible-panel-height')).toMatch(/px$/)
      )
    })

    it('unmounts a zero-size panel without waiting for unrelated transitions', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      render(StyledCollapsible, {
        open: true,
        content: '',
        panelClass: 'zero-size-panel',
        css: `
          .zero-size-panel {
            overflow: hidden;
            width: 0;
            height: 0;
            opacity: 1;
            transition: opacity 10s linear;
          }
          .zero-size-panel[data-ending-style] { opacity: 0; }
        `
      })

      const trigger = screen.getByRole('button', { name: 'Trigger' })

      expect(screen.getByTestId('panel')).toHaveAttribute('data-open')

      await fireEvent.click(trigger)
      await waitForAnimationFrame()

      expect(screen.queryByTestId('panel')).toBe(null)
    })

    it('preserves inline alignment styles while measuring an opening panel', async () => {
      render(StyledCollapsible, {
        keepMounted: true,
        panelClass: 'mixed-motion-panel',
        panelStyle: 'justify-content: center;',
        css: `
          @keyframes panel-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .mixed-motion-panel {
            height: var(--collapsible-panel-height);
            transition: height 100ms linear;
            animation: panel-fade-in 100ms linear;
          }
          .mixed-motion-panel[data-starting-style] { height: 0; }
        `
      })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const panel = screen.getByTestId('panel')

      fireEvent.click(trigger)
      flushSync()

      expect(panel).toHaveAttribute('data-starting-style')
      expect(panel.style.getPropertyValue('justify-content')).toBe('initial')
      expect(panel.style.getPropertyPriority('justify-content')).toBe('important')

      await waitForAnimationFrame()

      expect(panel.style.justifyContent).toBe('center')
    })

    it('keeps exit transitions working after a close is interrupted by reopening', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      const user = userEvent.setup()
      render(StyledCollapsible, {
        open: true,
        panelClass: 'interruptible-panel',
        css: `
          .interruptible-panel {
            overflow: hidden;
            height: var(--collapsible-panel-height);
            transition: height 100ms linear;
          }
          .interruptible-panel[data-starting-style],
          .interruptible-panel[data-ending-style] { height: 0; }
        `
      })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const panel = screen.getByTestId('panel')

      await user.click(trigger)
      await waitFor(() => expect(panel).toHaveAttribute('data-ending-style'))

      await user.click(trigger)
      await waitFor(() => expect(panel).toHaveAttribute('data-open'))
      await waitFor(() => expect(panel).not.toHaveAttribute('data-starting-style'))

      await fireEvent.click(trigger)
      await waitFor(() => expect(panel).toHaveAttribute('data-ending-style'))
      expect(screen.getByTestId('panel')).toBe(panel)
    })

    it('keeps the measured size when an open animation finishes during a close commit', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort').mockImplementation(() => {})
      let animationStarted = false
      const animation = new Animation(new KeyframeEffect(null, [], 10_000), document.timeline)
      animation.play()

      try {
        render(StyledCollapsible, {
          open: true,
          keepMounted: true,
          panelStyle: 'transition: height 10s linear;'
        })

        const panel = screen.getByTestId('panel')
        panel.getAnimations = () => {
          if (panel.hasAttribute('data-open')) {
            animationStarted = true
            return [animation]
          }

          return []
        }

        await waitForAnimationFrame()
        expect(animationStarted).toBe(true)

        await fireEvent.click(screen.getByRole('button', { name: 'Trigger' }))
        animation.finish()
        await flushMicrotasks()

        expect(panel.style.getPropertyValue('--collapsible-panel-height')).toMatch(/px$/)
      } finally {
        animation.cancel()
        abortSpy.mockRestore()
      }
    })

    it('does not restart the entrance transition when a close animation finishes after reopening', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort').mockImplementation(() => {})
      let closeAnimationStarted = false
      const closeAnimation = new Animation(new KeyframeEffect(null, [], 10_000), document.timeline)
      closeAnimation.play()

      try {
        render(StyledCollapsible, {
          open: true,
          panelStyle: 'transition: height 10s linear;'
        })

        const trigger = screen.getByRole('button', { name: 'Trigger' })
        const panel = screen.getByTestId('panel')
        panel.getAnimations = () => {
          if (panel.hasAttribute('data-ending-style')) {
            closeAnimationStarted = true
            return [closeAnimation]
          }

          return []
        }

        await fireEvent.click(trigger)
        await waitFor(() => expect(closeAnimationStarted).toBe(true))

        await fireEvent.click(trigger)
        await waitFor(() => expect(panel).toHaveAttribute('data-open'))
        await waitFor(() => expect(panel).not.toHaveAttribute('data-starting-style'))

        closeAnimation.finish()
        await flushMicrotasks()

        expect(panel).toHaveAttribute('data-open')
        expect(panel).not.toHaveAttribute('data-starting-style')
        expect(screen.getByTestId('panel')).toBe(panel)
      } finally {
        closeAnimation.cancel()
        abortSpy.mockRestore()
      }
    })
  })

  describe.skipIf(isJSDOM)('CSS animations', () => {
    it('does not run the mount animation when initially open', async () => {
      render(StyledCollapsible, {
        open: true,
        panelClass: 'animation-test-panel',
        css: `
          @keyframes panel-slide-down {
            from { height: 0; }
            to { height: var(--collapsible-panel-height); }
          }
          .animation-test-panel[data-open] {
            overflow: hidden;
            animation: panel-slide-down 100ms linear;
          }
        `
      })

      const panel = screen.getByTestId('panel')
      expect(panel).toHaveAttribute('data-open')
      expect(panel.getAnimations().length).toBe(0)
      expect(getComputedStyle(panel).animationName).toBe('none')
    })

    it('still animates on close and reopen after being initially open', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      const user = userEvent.setup()
      render(StyledCollapsible, {
        open: true,
        keepMounted: true,
        panelClass: 'animation-test-panel',
        css: `
          @keyframes panel-slide-down {
            from { height: 0; }
            to { height: var(--collapsible-panel-height); }
          }
          @keyframes panel-slide-up {
            from { height: var(--collapsible-panel-height); }
            to { height: 0; }
          }
          .animation-test-panel[data-open] { overflow: hidden; animation: panel-slide-down 100ms linear; }
          .animation-test-panel[data-closed] { overflow: hidden; animation: panel-slide-up 100ms linear; }
        `
      })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const panel = screen.getByTestId('panel')

      expect(panel.getAnimations().length).toBe(0)

      await user.click(trigger)
      await waitFor(() => {
        expect(panel).toHaveAttribute('data-closed')
        expect(panel.getAnimations().length).toBe(1)
      })

      await user.click(trigger)
      await waitFor(() => {
        expect(panel).toHaveAttribute('data-open')
        expect(panel.getAnimations().length).toBe(1)
      })
    })

    it('restores measured dimensions before applying a closing keyframe animation', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      const user = userEvent.setup()
      render(StyledCollapsible, {
        open: true,
        panelClass: 'closing-animation-panel',
        css: `
          @keyframes panel-slide-up {
            from { height: var(--collapsible-panel-height); }
            to { height: 0; }
          }
          .closing-animation-panel[data-closed] {
            overflow: hidden;
            animation: panel-slide-up 100ms linear;
          }
        `
      })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const panel = screen.getByTestId('panel')

      await waitFor(() =>
        expect(panel.style.getPropertyValue('--collapsible-panel-height')).toBe('auto')
      )

      await user.click(trigger)

      await waitFor(() => expect(panel).toHaveAttribute('data-ending-style'))
      await waitFor(() =>
        expect(panel.style.getPropertyValue('--collapsible-panel-height')).toMatch(/px$/)
      )
      expect(panel.getAnimations().length).toBe(1)
    })

    it('still animates on reopen after being initially open when only open keyframes are defined', async () => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      const user = userEvent.setup()
      render(StyledCollapsible, {
        open: true,
        keepMounted: true,
        panelClass: 'animation-test-panel',
        css: `
          @keyframes panel-slide-down {
            from { height: 0; }
            to { height: var(--collapsible-panel-height); }
          }
          .animation-test-panel[data-open] { overflow: hidden; animation: panel-slide-down 100ms linear; }
        `
      })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const panel = screen.getByTestId('panel')

      expect(panel.getAnimations().length).toBe(0)

      await user.click(trigger)
      await waitFor(() => expect(panel).toHaveAttribute('data-closed'))

      await user.click(trigger)
      await waitFor(() => {
        expect(panel).toHaveAttribute('data-open')
        expect(panel.getAnimations().length).toBe(1)
      })
    })
  })

  describe('initial keyframe animation suppression', () => {
    it('suppresses the initial keyframe animation when rendered open', () => {
      render(StyledCollapsible, {
        open: true,
        panelClass: 'animation-test-panel',
        css: `
          @keyframes panel-slide-down {
            from { height: 0; }
            to { height: var(--collapsible-panel-height); }
          }
          .animation-test-panel[data-open] {
            animation: panel-slide-down 100ms linear;
          }
        `
      })

      expect(screen.getByTestId('panel').style.animationName).toBe('none')
    })

    it('suppresses the initial keyframe animation from inline styles when rendered open', () => {
      render(StyledCollapsible, {
        open: true,
        panelStyle:
          'animation-duration: 100ms; animation-name: panel-slide-down; animation-timing-function: linear;',
        css: `
          @keyframes panel-slide-down {
            from { height: 0; }
            to { height: var(--collapsible-panel-height); }
          }
        `
      })

      const panel = screen.getByTestId('panel')

      expect(panel.style.animationName).toBe('none')
      expect(panel.style.animationDuration).toBe('100ms')
    })
  })

  describe.skipIf(isJSDOM || !('onbeforematch' in window))('interrupted beforematch opens', () => {
    it('keeps the temporary zero animation duration until the panel closes', async () => {
      const user = userEvent.setup()
      render(StyledCollapsible, {
        hiddenUntilFound: true,
        keepMounted: true,
        panelClass: 'animation-test-panel',
        css: `
          @keyframes panel-slide-down { from { height: 0; } to { height: var(--collapsible-panel-height); } }
          @keyframes panel-slide-up { from { height: var(--collapsible-panel-height); } to { height: 0; } }
          .animation-test-panel { overflow: hidden; animation-duration: 123ms; }
          .animation-test-panel[data-open] { animation-name: panel-slide-down; }
          .animation-test-panel[data-closed] { animation-name: panel-slide-up; }
        `
      })

      const panel = screen.getByTestId('panel')
      const trigger = screen.getByRole('button', { name: 'Trigger' })

      fireBeforeMatch(panel)
      await waitFor(() => expect(panel).toHaveAttribute('data-open'))

      await waitForAnimationFrame()
      await waitForAnimationFrame()
      expect(getComputedStyle(panel).animationDuration).toBe('0s')

      await user.click(trigger)
      await waitFor(() => {
        expect(panel).toHaveAttribute('data-closed')
        expect(panel.getAnimations().length).toBe(1)
      })
      expect(getComputedStyle(panel).animationDuration).toBe('0.123s')
    })

    it('restores the transition duration before the first close after a beforematch open', async () => {
      const user = userEvent.setup()
      render(StyledCollapsible, {
        hiddenUntilFound: true,
        keepMounted: true,
        panelClass: 'transition-test-panel',
        panelStyle: 'transition-duration: 123ms;',
        css: `
          .transition-test-panel {
            overflow: hidden;
            height: var(--collapsible-panel-height);
            transition-property: height;
            transition-duration: 999ms;
            transition-timing-function: linear;
          }
          .transition-test-panel[data-starting-style],
          .transition-test-panel[data-ending-style] { height: 0; }
        `
      })

      const panel = screen.getByTestId('panel')
      const trigger = screen.getByRole('button', { name: 'Trigger' })

      fireBeforeMatch(panel)
      await waitFor(() => expect(panel).toHaveAttribute('data-open'))

      await waitForAnimationFrame()
      await waitForAnimationFrame()
      expect(getComputedStyle(panel).transitionDuration).toBe('0s')

      await user.click(trigger)
      await waitFor(() => expect(panel).toHaveAttribute('data-ending-style'))
      await waitFor(() => expect(panel.style.transitionDuration).toBe('123ms'))
    })

    it('does not suppress a later animated open after a no-motion beforematch open', async () => {
      const user = userEvent.setup()
      render(DeferredMotionCollapsible, {
        panelClass: 'transition-test-panel',
        panelStyle: 'transition-duration: 123ms;',
        css: `
          .transition-test-panel {
            overflow: hidden;
            height: var(--collapsible-panel-height);
            transition: height 100ms linear;
          }
          .transition-test-panel[data-starting-style],
          .transition-test-panel[data-ending-style] { height: 0; }
        `
      })

      const panel = screen.getByTestId('panel')
      const trigger = screen.getByRole('button', { name: 'Trigger' })

      fireBeforeMatch(panel)
      await waitFor(() => expect(panel).toHaveAttribute('data-open'))

      await user.click(trigger)
      await waitFor(() => expect(panel).toHaveAttribute('data-closed'))

      await user.click(screen.getByTestId('enable-motion'))
      await fireEvent.click(trigger)
      expect(panel).toHaveAttribute('data-open')
      expect(panel.style.transitionDuration).toBe('123ms')
    })

    it('does not keep a hidden transition running after a hiddenUntilFound panel closes', async () => {
      render(StyledCollapsible, {
        hiddenUntilFound: true,
        panelClass: 'transition-test-panel',
        css: `
          .transition-test-panel {
            overflow: hidden;
            height: var(--collapsible-panel-height);
            opacity: 1;
            transition: height 1000ms linear, opacity 1000ms linear;
          }
          .transition-test-panel[data-starting-style],
          .transition-test-panel[data-ending-style] { height: 0; opacity: 0; }
        `
      })

      const panel = screen.getByTestId('panel')
      const trigger = screen.getByRole('button', { name: 'Trigger' })

      trigger.click()
      flushSync()
      expect(panel).toHaveAttribute('data-open')

      trigger.click()
      flushSync()
      await waitFor(() => expect(panel).toHaveAttribute('hidden', 'until-found'))

      await waitForAnimationFrame()
      await waitForAnimationFrame()

      expect(
        panel.getAnimations().filter((animation) => animation.playState !== 'finished').length
      ).toBe(0)
      expect(getComputedStyle(panel).opacity).toBe('0')
    })
  })

  describe.skipIf(!('onbeforematch' in window) || isJSDOM)('prop: hiddenUntilFound', () => {
    it('opens the collapsible when a `beforematch` event fires on the panel', async () => {
      const handleOpenChange = vi.fn()
      render(HiddenUntilFoundCollapsible, { onOpenChange: handleOpenChange })

      const trigger = screen.getByRole('button', { name: 'Trigger' })
      const panel = screen.getByTestId('panel')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      fireBeforeMatch(panel)

      await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
      expect(handleOpenChange).toHaveBeenCalledTimes(1)
      expect(handleOpenChange).toHaveBeenCalledWith(true)
      expect(panel).toHaveAttribute('data-open')
      expect(panel).not.toHaveAttribute('hidden')
    })

    it('does not open or suppress the next trigger open when beforematch is declined', async () => {
      const user = userEvent.setup()
      const handleOpenChange = vi.fn()
      render(DecliningBeforeMatchCollapsible, {
        onOpenChange: handleOpenChange,
        css: `
          .transition-test-panel {
            overflow: hidden;
            height: var(--collapsible-panel-height);
            transition-property: height;
            transition-duration: 999ms;
            transition-timing-function: linear;
          }
          .transition-test-panel[data-starting-style],
          .transition-test-panel[data-ending-style] { height: 0; }
        `
      })

      const panel = screen.getByTestId('panel')
      const trigger = screen.getByRole('button', { name: 'Trigger' })

      fireBeforeMatch(panel)

      expect(handleOpenChange).toHaveBeenCalledTimes(1)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(panel).toHaveAttribute('data-closed')

      await user.click(screen.getByTestId('allow'))
      await user.click(trigger)

      expect(handleOpenChange).toHaveBeenCalledTimes(2)
      await waitFor(() => expect(panel).toHaveAttribute('data-open'))
      expect(panel.style.transitionDuration).toBe('123ms')
    })
  })
})
