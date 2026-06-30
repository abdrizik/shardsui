import { render, waitFor } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import BasicDrawer from './fixtures/basic-drawer.svelte'

vi.mock('$lib/internal/detect-browser', async (importActual) => {
  const actual = await importActual<typeof import('$lib/internal/detect-browser')>()
  return { ...actual, isAndroid: true }
})

describe('<Drawer.Root />', () => {
  it('closes when CloseWatcher emits a close event', async () => {
    const handleOpenChange = vi.fn()

    class CloseWatcherStub extends EventTarget {
      static instances: CloseWatcherStub[] = []
      destroy = vi.fn()
      close = vi.fn()
      requestClose = vi.fn()
      constructor() {
        super()
        CloseWatcherStub.instances.push(this)
      }
    }

    const originalCloseWatcher = (window as Window & { CloseWatcher?: unknown }).CloseWatcher
    ;(window as Window & { CloseWatcher?: typeof CloseWatcherStub }).CloseWatcher = CloseWatcherStub

    try {
      render(BasicDrawer, { open: true, onOpenChange: handleOpenChange })

      await waitFor(() => {
        expect(CloseWatcherStub.instances.length).toBeGreaterThan(0)
      })

      const instance = CloseWatcherStub.instances[CloseWatcherStub.instances.length - 1]
      expect(instance).not.toBeUndefined()

      instance.dispatchEvent(new Event('close'))

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalled()
      })

      const lastCall = handleOpenChange.mock.calls[handleOpenChange.mock.calls.length - 1]
      expect(lastCall?.[0]).toBe(false)
    } finally {
      ;(window as Window & { CloseWatcher?: unknown }).CloseWatcher = originalCloseWatcher
    }
  })
})
