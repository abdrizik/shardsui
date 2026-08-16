import { render, screen, waitFor } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AnimatedFallbackAvatar from './fixtures/animated-fallback-avatar.svelte'
import AvatarFallbackProps from './fixtures/avatar-fallback-props.svelte'
import BasicAvatar from './fixtures/basic-avatar.svelte'
import FallbackDelayAvatar from './fixtures/fallback-delay-avatar.svelte'
import { mockImageProbe } from './fixtures/mock-image'

// 1x1 transparent PNG
const DATA_URI =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('<Avatar.Fallback />', () => {
  it('renders a span', () => {
    const { container } = render(AvatarFallbackProps)

    expect(container.querySelector('span')).toBeInTheDocument()
  })

  it('forwards extra props to the element', () => {
    render(AvatarFallbackProps, {
      class: 'my-fallback',
      style: 'opacity: 0.5;',
      'data-testid': 'fallback'
    })
    const fallback = screen.getByTestId('fallback')

    expect(fallback).toHaveClass('my-fallback')
    expect(fallback).toHaveStyle('opacity: 0.5')
  })

  it('renders the element specified by the as prop', () => {
    render(AvatarFallbackProps, { as: 'div', 'data-testid': 'fallback' })

    expect(screen.getByTestId('fallback').tagName).toBe('DIV')
  })

  it.skipIf(!isJSDOM)('does not render the children if the image loaded', async () => {
    const imageMock = mockImageProbe({ completeOnSet: true })
    try {
      render(BasicAvatar, { src: 'https://example.com/cached-avatar.png', fallbackText: 'JD' })

      await waitFor(() => {
        expect(screen.queryByText('JD')).toBeNull()
      })
    } finally {
      imageMock.restore()
    }
  })

  it.skipIf(!isJSDOM)('renders the fallback if the image fails to load', async () => {
    const imageMock = mockImageProbe({ completeOnSet: true, naturalWidth: 0 })
    try {
      render(BasicAvatar, { src: 'broken-image.png', fallbackText: 'AC' })

      await waitFor(() => {
        expect(screen.queryByText('AC')).not.toBeNull()
      })
    } finally {
      imageMock.restore()
    }
  })

  it.skipIf(!isJSDOM)('shows the fallback when a loaded image is unmounted', async () => {
    const imageMock = mockImageProbe({ completeOnSet: true })
    try {
      const { container, rerender } = render(BasicAvatar, { src: 'avatar.png', fallbackText: 'AC' })

      await waitFor(() => expect(screen.queryByText('AC')).toBeNull())
      expect(container.querySelector('img')).toBeInTheDocument()

      await rerender({ src: undefined, fallbackText: 'AC' })

      await waitFor(() => expect(screen.getByText('AC')).toBeInTheDocument())
      expect(container.querySelector('img')).toBeNull()
    } finally {
      imageMock.restore()
    }
  })

  describe.skipIf(!isJSDOM)('prop: delay', () => {
    it('shows the fallback when the delay has elapsed', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: false })
      try {
        render(FallbackDelayAvatar, { delay: 100 })
        expect(screen.queryByText('AC')).toBeNull()

        await vi.advanceTimersByTimeAsync(100)

        expect(screen.getByText('AC')).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })

    it('shows the fallback immediately when delay is 0', () => {
      vi.useFakeTimers({ shouldAdvanceTime: false })
      try {
        render(FallbackDelayAvatar, { delay: 0 })

        expect(screen.getByText('AC')).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })

    it('shows the fallback when delay changes to 0', async () => {
      const { rerender } = render(FallbackDelayAvatar, { delay: 100 })
      expect(screen.queryByText('AC')).toBeNull()

      await rerender({ delay: 0 })

      expect(screen.getByText('AC')).toBeInTheDocument()
    })

    it('keeps the fallback visible when delay changes from undefined to a number', async () => {
      const { rerender } = render(FallbackDelayAvatar, { delay: undefined })
      expect(screen.getByText('AC')).toBeInTheDocument()

      await rerender({ delay: 100 })

      expect(screen.getByText('AC')).toBeInTheDocument()
    })

    it('keeps the fallback visible across a number -> undefined -> number delay change', async () => {
      const { rerender } = render(FallbackDelayAvatar, { delay: 100 })
      expect(screen.queryByText('AC')).toBeNull()

      await rerender({ delay: undefined })
      expect(screen.getByText('AC')).toBeInTheDocument()

      await rerender({ delay: 100 })
      expect(screen.getByText('AC')).toBeInTheDocument()
    })
  })

  it.skipIf(!isJSDOM)(
    'keeps fallback mounted and image unmounted while the image is loading',
    async () => {
      render(BasicAvatar, { src: 'avatar.png', fallbackText: 'AC' })

      await waitFor(() => {
        expect(screen.queryByRole('img')).toBeNull()
        expect(screen.getByText('AC')).toBeInTheDocument()
      })
    }
  )

  describe.skipIf(isJSDOM)('regression', () => {
    it('keeps only one of image or fallback mounted when switching to image', async () => {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes test-exit { to { opacity: 0; } }
        .animation-test-fallback[data-ending-style] { animation: test-exit 2s; }
      `
      document.head.appendChild(style)

      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      try {
        const { rerender } = render(AnimatedFallbackAvatar, { src: undefined })

        expect(screen.queryByTestId('image')).toBeNull()
        expect(screen.getByTestId('fallback')).toBeInTheDocument()

        await rerender({ src: DATA_URI })

        await waitFor(() => {
          expect(screen.queryByTestId('image')).not.toBeNull()
          expect(screen.queryByTestId('fallback')).toBeNull()
        })
      } finally {
        document.head.removeChild(style)
      }
    })
  })
})
