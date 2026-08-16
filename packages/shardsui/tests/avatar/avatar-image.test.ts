import { render, screen, waitFor } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AvatarImageAttrs from './fixtures/avatar-image-attrs.svelte'
import AvatarImageProps from './fixtures/avatar-image-props.svelte'
import AvatarImageSrcSetOnly from './fixtures/avatar-image-src-set-only.svelte'
import BasicAvatar from './fixtures/basic-avatar.svelte'
import { mockImageProbe } from './fixtures/mock-image'
import ToggleImageSrc from './fixtures/toggle-image-src.svelte'

describe('<Avatar.Image />', () => {
  let restoreImage: () => void

  beforeEach(() => {
    restoreImage = mockImageProbe({ completeOnSet: true }).restore
  })

  afterEach(() => {
    restoreImage()
  })

  it('renders an img', async () => {
    const { container } = render(AvatarImageProps)

    await waitFor(() => expect(container.querySelector('img')).toBeInTheDocument())
  })

  it('forwards extra props to the element', async () => {
    render(AvatarImageProps, {
      class: 'my-image',
      style: 'opacity: 0.5;',
      'data-testid': 'image'
    })

    await waitFor(() => expect(screen.getByTestId('image')).toBeInTheDocument())
    expect(screen.getByTestId('image')).toHaveClass('my-image')
    expect(screen.getByTestId('image')).toHaveStyle('opacity: 0.5')
  })

  it('renders the element specified by the as prop', async () => {
    render(AvatarImageProps, { as: 'div', 'data-testid': 'image' })

    await waitFor(() => expect(screen.getByTestId('image').tagName).toBe('DIV'))
  })

  it.skipIf(!isJSDOM)('shows the image immediately for a cached src', async () => {
    const { container } = render(BasicAvatar, {
      src: 'https://example.com/cached-avatar.png',
      fallbackText: 'JD'
    })

    await waitFor(() => {
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/cached-avatar.png')
      expect(screen.queryByText('JD')).toBeNull()
    })
  })

  it.skipIf(!isJSDOM)('passes native image props to the rendered image', async () => {
    const { container } = render(AvatarImageAttrs)

    await waitFor(() => {
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('crossorigin', 'anonymous')
      expect(img).toHaveAttribute('referrerpolicy', 'no-referrer')
      expect(img).toHaveAttribute('sizes', '48px')
      expect(img).toHaveAttribute('srcset', 'avatar.png 1x, avatar@2x.png 2x')
    })
  })

  it.skipIf(!isJSDOM)('shows the image when only srcset is provided', async () => {
    const { container } = render(AvatarImageSrcSetOnly)

    await waitFor(() => {
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('srcset', 'avatar.png 1x, avatar@2x.png 2x')
      expect(screen.queryByText('FB')).toBeNull()
    })
  })

  it.skipIf(!isJSDOM)('passes responsive image props to the loading probe', async () => {
    const imageMock = mockImageProbe()
    try {
      render(AvatarImageAttrs, { src: 'fallback.png' })

      await waitFor(() => expect(imageMock.images.length).toBeGreaterThan(0))
      expect(imageMock.images[0].sizes).toBe('48px')
      expect(imageMock.images[0].srcset).toBe('avatar.png 1x, avatar@2x.png 2x')
      expect(imageMock.images[0].src).toBe('fallback.png')
    } finally {
      imageMock.restore()
    }
  })

  describe.skipIf(!isJSDOM)('prop: onLoadingStatusChange', () => {
    it('fires when the image loads', async () => {
      const imageMock = mockImageProbe()
      try {
        const onLoadingStatusChange = vi.fn()
        render(BasicAvatar, { src: 'avatar.png', onLoadingStatusChange })

        await waitFor(() => expect(onLoadingStatusChange).toHaveBeenCalledWith('loading'))

        imageMock.images.at(-1)?.onload?.()

        await waitFor(() =>
          expect(onLoadingStatusChange.mock.calls.map(([status]) => status)).toEqual([
            'loading',
            'loaded'
          ])
        )
      } finally {
        imageMock.restore()
      }
    })

    it('fires when the image errors', async () => {
      const imageMock = mockImageProbe()
      try {
        const onLoadingStatusChange = vi.fn()
        render(BasicAvatar, { src: 'avatar.png', onLoadingStatusChange })

        await waitFor(() => expect(onLoadingStatusChange).toHaveBeenCalledWith('loading'))

        imageMock.images.at(-1)?.onerror?.()

        await waitFor(() =>
          expect(onLoadingStatusChange.mock.calls.map(([status]) => status)).toEqual([
            'loading',
            'error'
          ])
        )
      } finally {
        imageMock.restore()
      }
    })

    it('fires for cached image errors without emitting idle', async () => {
      const imageMock = mockImageProbe({ completeOnSet: true, naturalWidth: 0 })
      try {
        const onLoadingStatusChange = vi.fn()
        render(BasicAvatar, { src: 'broken.png', onLoadingStatusChange })

        await waitFor(() => expect(onLoadingStatusChange).toHaveBeenCalledWith('error'))

        expect(onLoadingStatusChange).not.toHaveBeenCalledWith('idle')
      } finally {
        imageMock.restore()
      }
    })

    it('does not re-notify when only the callback identity changes', async () => {
      const first = vi.fn()
      const second = vi.fn()
      const { rerender } = render(BasicAvatar, {
        src: 'avatar.png',
        onLoadingStatusChange: first
      })

      await waitFor(() => expect(first).toHaveBeenCalledWith('loaded'))

      await rerender({ src: 'avatar.png', onLoadingStatusChange: second })

      expect(second).not.toHaveBeenCalled()
    })
  })

  describe.skipIf(isJSDOM)('animations', () => {
    it('triggers enter animation via data-starting-style when mounting', async () => {
      const style = document.createElement('style')
      style.textContent = `
        .animation-test-image { transition: opacity 1ms; }
        .animation-test-image[data-starting-style],
        .animation-test-image[data-ending-style] { opacity: 0; }
      `
      document.head.appendChild(style)

      const imageMock = mockImageProbe()
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      try {
        let transitionFinished = false
        const { rerender } = render(ToggleImageSrc, {
          showImage: false,
          ontransitionend: () => {
            transitionFinished = true
          }
        })
        expect(screen.queryByTestId('image')).toBeNull()

        await rerender({
          showImage: true,
          ontransitionend: () => {
            transitionFinished = true
          }
        })

        await waitFor(() => expect(imageMock.images.length).toBeGreaterThan(0))
        const probe = imageMock.images[imageMock.images.length - 1]
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => {
            probe.complete = true
            probe.naturalWidth = 100
            probe.onload?.()
            resolve()
          })
        )

        await waitFor(() => expect(transitionFinished).toBe(true))
        expect(screen.getByTestId('image')).not.toBeNull()
      } finally {
        imageMock.restore()
        document.head.removeChild(style)
      }
    })

    it('applies data-ending-style before unmount', async () => {
      const style = document.createElement('style')
      style.textContent = `
        @keyframes test-anim { to { opacity: 0; } }
        .animation-test-image[data-ending-style] { animation: test-anim 1ms; }
      `
      document.head.appendChild(style)

      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      try {
        const { rerender } = render(ToggleImageSrc, { showImage: true })
        await waitFor(() => expect(screen.getByTestId('image')).toBeInTheDocument())

        await rerender({ showImage: false })

        await waitFor(() =>
          expect(screen.getByTestId('image')).toHaveAttribute('data-ending-style')
        )
        await waitFor(() => expect(screen.queryByTestId('image')).toBeNull())
      } finally {
        document.head.removeChild(style)
      }
    })
  })
})
