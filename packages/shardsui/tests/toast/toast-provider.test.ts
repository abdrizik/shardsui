import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { tick } from 'svelte'
import { expect, vi } from 'vitest'
import DeferredViewportToast from './fixtures/deferred-viewport-toast.svelte'
import DialogToast from './fixtures/dialog-toast.svelte'
import LimitToast from './fixtures/limit-toast.svelte'
import LimitUpsertToast from './fixtures/limit-upsert-toast.svelte'
import LoadingTypeToast from './fixtures/loading-type-toast.svelte'
import MultipleProviders from './fixtures/multiple-providers.svelte'
import OnCloseAlreadyEndingToast from './fixtures/on-close-already-ending-toast.svelte'
import PromiseCustomOptionsToast from './fixtures/promise-custom-options-toast.svelte'
import PromiseLoadingTimeoutToast from './fixtures/promise-loading-timeout-toast.svelte'
import PromiseToast from './fixtures/promise-toast.svelte'
import ProviderTimeoutToast from './fixtures/provider-timeout-toast.svelte'
import ReplaceCloseNoViewport from './fixtures/replace-close-no-viewport.svelte'
import ReplaceCloseToast from './fixtures/replace-close-toast.svelte'
import ResetTimeoutFromZeroToast from './fixtures/reset-timeout-from-zero-toast.svelte'
import ResetTimeoutToast from './fixtures/reset-timeout-toast.svelte'
import TimedToast from './fixtures/timed-toast.svelte'
import ToastManager from './fixtures/toast-manager.svelte'
import UpsertToast from './fixtures/upsert-toast.svelte'
import UpsertTransitionToast from './fixtures/upsert-transition-toast.svelte'

const FAKE_TIMERS: Parameters<typeof vi.useFakeTimers>[0] = {
  toFake: ['setTimeout', 'clearTimeout']
}

function withFakeTimers() {
  beforeEach(() => vi.useFakeTimers(FAKE_TIMERS))
  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })
}

async function advanceTime(ms: number) {
  vi.advanceTimersByTime(ms)
  await tick()
}

describe('<Toast.Provider />', () => {
  afterEach(() => cleanup())

  describe('add', () => {
    it('adds a toast to the viewport', async () => {
      render(ToastManager)
      fireEvent.click(screen.getByTestId('add-button'))
      await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())
    })

    it('returns a toast id', async () => {
      render(ToastManager)
      fireEvent.click(screen.getByTestId('add-button'))
      await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())
      expect(screen.getByTestId('root').getAttribute('data-toast-id')).toBeTruthy()
    })

    it('upserts a toast when adding with an existing id', async () => {
      render(UpsertToast, { timeout: 0 })
      fireEvent.click(screen.getByTestId('add-first'))
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Saving...'))
      expect(screen.getByTestId('first-id')).toHaveTextContent('save')

      fireEvent.click(screen.getByTestId('add-second'))
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Saved'))

      expect(screen.getByTestId('second-id')).toHaveTextContent('save')
      expect(screen.getAllByTestId('root')).toHaveLength(1)
    })

    it('increments updateKey when adding again with the same id', async () => {
      render(UpsertToast, { timeout: 0 })

      fireEvent.click(screen.getByTestId('add-first'))
      await waitFor(() => expect(screen.getByTestId('update-key')).toHaveTextContent('0'))

      fireEvent.click(screen.getByTestId('add-second'))
      await waitFor(() => expect(screen.getByTestId('update-key')).toHaveTextContent('1'))
    })

    it('keeps multiple providers isolated when one provider updates', async () => {
      render(MultipleProviders)

      await fireEvent.click(screen.getByTestId('add-first'))
      await fireEvent.click(screen.getByTestId('add-second'))

      expect(screen.getByTestId('title-1')).toHaveTextContent('First toast')
      expect(screen.getByTestId('title-2')).toHaveTextContent('Second toast')

      await fireEvent.click(screen.getByTestId('update-first'))

      await waitFor(() =>
        expect(screen.getByTestId('title-1')).toHaveTextContent('First toast updated')
      )
      expect(screen.queryByText('Second toast updated')).toBeNull()
      expect(screen.getByTestId('title-2')).toHaveTextContent('Second toast')
    })

    it('replaces a closing toast when adding again with the same id', async () => {
      render(ReplaceCloseToast)
      fireEvent.click(screen.getByTestId('add-button'))
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Saving...'))
      expect(screen.getAllByTestId('root')).toHaveLength(1)

      fireEvent.click(screen.getByTestId('close-button'))
      fireEvent.click(screen.getByTestId('re-add-button'))

      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Saved'))
      expect(screen.getAllByTestId('root')).toHaveLength(1)
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1')
    })

    it('does not call onRemove when replacing an ending toast', async () => {
      const onRemove = vi.fn()
      render(ReplaceCloseNoViewport, { onRemove })
      fireEvent.click(screen.getByTestId('add-button'))
      await waitFor(() => expect(screen.getByTestId('toast-count')).toHaveTextContent('1'))

      fireEvent.click(screen.getByTestId('close-button'))
      fireEvent.click(screen.getByTestId('re-add-button'))

      await waitFor(() => expect(screen.getByTestId('toast-count')).toHaveTextContent('1'))
      expect(onRemove).toHaveBeenCalledTimes(0)
    })

    it('calls onRemove once after replacing an ending toast and later removing the replacement', async () => {
      const onRemove = vi.fn()
      render(DeferredViewportToast, { onRemove })

      fireEvent.click(screen.getByTestId('add-button'))
      await waitFor(() => expect(screen.getByTestId('toast-count')).toHaveTextContent('1'))

      fireEvent.click(screen.getByTestId('close-button'))
      fireEvent.click(screen.getByTestId('re-add-button'))

      await waitFor(() => expect(screen.getByTestId('toast-count')).toHaveTextContent('1'))
      expect(onRemove).toHaveBeenCalledTimes(0)

      fireEvent.click(screen.getByTestId('show-viewport'))
      await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())

      fireEvent.click(screen.getByTestId('close-button'))
      await waitFor(() => expect(onRemove).toHaveBeenCalledTimes(1))
    })

    it('ignores transitionStatus when upserting an existing toast', async () => {
      render(UpsertTransitionToast)
      fireEvent.click(screen.getByTestId('add-button'))
      await waitFor(() => expect(screen.getByTestId('title-value')).toHaveTextContent('Saving...'))
      expect(screen.getByTestId('transition-status')).toHaveTextContent('starting')

      fireEvent.click(screen.getByTestId('upsert-button'))
      await waitFor(() => expect(screen.getByTestId('title-value')).toHaveTextContent('Saved'))
      expect(screen.getByTestId('transition-status')).not.toHaveTextContent('ending')
    })

    describe('option: timeout', () => {
      withFakeTimers()

      it('dismisses the toast after 5s by default', async () => {
        render(TimedToast)
        screen.getByTestId('add-button').click()
        await tick()
        expect(screen.getByTestId('root')).toBeInTheDocument()

        await advanceTime(4999)
        expect(screen.queryByTestId('root')).not.toBeNull()

        await advanceTime(1)
        expect(screen.queryByTestId('root')).toBeNull()
      })

      it('dismisses the toast after the specified timeout', async () => {
        render(TimedToast, { timeout: 1000 })
        screen.getByTestId('add-button').click()
        await tick()
        expect(screen.getByTestId('root')).toBeInTheDocument()

        await advanceTime(1000)
        expect(screen.queryByTestId('root')).toBeNull()
      })
    })

    describe('option: title', () => {
      it('renders the title', async () => {
        render(ToastManager)
        fireEvent.click(screen.getByTestId('add-title'))
        await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('title'))
      })
    })

    describe('option: description', () => {
      it('renders the description', async () => {
        render(ToastManager)
        fireEvent.click(screen.getByTestId('add-title'))
        await waitFor(() =>
          expect(screen.getByTestId('description')).toHaveTextContent('description')
        )
      })
    })

    describe('option: type', () => {
      it('renders the type', async () => {
        render(ToastManager)
        fireEvent.click(screen.getByTestId('add-type'))
        await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('test'))
        expect(screen.getByTestId('type')).toHaveTextContent('success')
      })
    })

    describe('option: onClose', () => {
      it('calls onClose when the toast is closed', async () => {
        const onClose = vi.fn()
        render(TimedToast, { timeout: 0, onClose })
        fireEvent.click(screen.getByTestId('add-button'))
        await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())

        expect(onClose).not.toHaveBeenCalled()
        fireEvent.click(screen.getByTestId('close'))
        expect(onClose).toHaveBeenCalledTimes(1)
      })

      describe('auto-dismiss', () => {
        withFakeTimers()

        it('calls onClose when the toast auto-dismisses', async () => {
          const onClose = vi.fn()
          render(TimedToast, { timeout: 1000, onClose })
          screen.getByTestId('add-button').click()
          await tick()
          expect(screen.getByTestId('root')).toBeInTheDocument()

          expect(onClose).not.toHaveBeenCalled()
          await advanceTime(1000)
          expect(onClose).toHaveBeenCalledTimes(1)
        })
      })
    })

    describe('option: onRemove', () => {
      it('calls onRemove when the toast is removed', async () => {
        const onRemove = vi.fn()
        render(TimedToast, { timeout: 0, onRemove })
        fireEvent.click(screen.getByTestId('add-button'))
        await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())

        expect(onRemove).not.toHaveBeenCalled()
        fireEvent.click(screen.getByTestId('close'))
        await waitFor(() => expect(onRemove).toHaveBeenCalledTimes(1))
      })
    })

    describe('option: priority', () => {
      it('applies correct ARIA attributes for high priority toasts', async () => {
        render(ToastManager)
        fireEvent.click(screen.getByTestId('add-high'))

        const root = await screen.findByTestId('root')
        await waitFor(() => expect(root).toHaveAttribute('role', 'alertdialog'))
        expect(root).toHaveAttribute('aria-modal', 'false')
        expect(root).toHaveAttribute('aria-hidden', 'true')

        const alert = document.querySelector('[role="alert"]')
        expect(alert).not.toBeNull()
        expect(alert).toHaveAttribute('aria-atomic', 'true')

        fireEvent.click(screen.getByTestId('close-button'))
        await waitFor(() => expect(document.querySelector('[role="alert"]')).toBeNull())
      })
    })
  })

  describe('promise', () => {
    it('displays success state as description after promise resolves', async () => {
      render(PromiseToast)
      fireEvent.click(screen.getByTestId('start-promise'))
      await waitFor(() => expect(screen.getByTestId('description')).toHaveTextContent('loading'))

      fireEvent.click(screen.getByTestId('resolve'))
      await waitFor(() => expect(screen.getByTestId('description')).toHaveTextContent('success'))
    })

    it('displays error state as description after promise rejects', async () => {
      render(PromiseToast)
      fireEvent.click(screen.getByTestId('start-reject'))
      await waitFor(() => expect(screen.getByTestId('description')).toHaveTextContent('loading'))

      fireEvent.click(screen.getByTestId('reject'))
      await waitFor(() => expect(screen.getByTestId('description')).toHaveTextContent('error'))
    })

    it('passes data when success is a function', async () => {
      render(PromiseToast)
      fireEvent.click(screen.getByTestId('start-fn-success'))
      await waitFor(() => expect(screen.getByTestId('description')).toHaveTextContent('loading'))

      fireEvent.click(screen.getByTestId('resolve'))
      await waitFor(() =>
        expect(screen.getByTestId('description')).toHaveTextContent('test success')
      )
    })

    it('passes data when error is a function', async () => {
      render(PromiseToast)
      fireEvent.click(screen.getByTestId('start-fn-error'))
      await waitFor(() => expect(screen.getByTestId('description')).toHaveTextContent('loading'))

      fireEvent.click(screen.getByTestId('reject'))
      await waitFor(() => expect(screen.getByTestId('description')).toHaveTextContent('test error'))
    })

    it('does not reopen a dismissed promise toast when it resolves', async () => {
      render(PromiseToast)
      fireEvent.click(screen.getByTestId('start-promise'))
      await waitFor(() => expect(screen.getByTestId('description')).toHaveTextContent('loading'))

      fireEvent.click(screen.getByTestId('close-all'))
      await waitFor(() => expect(screen.queryByTestId('root')).toBeNull())

      fireEvent.click(screen.getByTestId('resolve'))
      await tick()
      expect(screen.queryByTestId('root')).toBeNull()
    })

    describe('supports custom options', () => {
      withFakeTimers()

      it('renders the custom loading title and description', async () => {
        render(PromiseCustomOptionsToast)
        fireEvent.click(screen.getByTestId('start-custom-loading'))
        await tick()
        expect(screen.getByTestId('title')).toHaveTextContent('loading title')
        expect(screen.getByTestId('description')).toHaveTextContent('loading description')
      })

      it('accepts a function that returns full options for the success state', async () => {
        render(PromiseCustomOptionsToast)
        fireEvent.click(screen.getByTestId('start-success-options-fn'))
        await tick()

        fireEvent.click(screen.getByTestId('resolve'))
        await waitFor(() =>
          expect(screen.getByTestId('title')).toHaveTextContent('saved test success')
        )
        expect(screen.getByTestId('description')).toHaveTextContent('done')

        await advanceTime(1999)
        expect(screen.queryByTestId('root')).not.toBeNull()

        await advanceTime(2)
        expect(screen.queryByTestId('root')).toBeNull()
      })
    })

    describe('timeout handling', () => {
      withFakeTimers()

      it('auto-dismisses success toast after default timeout when promise resolves', async () => {
        render(PromiseToast, { timeout: 1000 })
        screen.getByTestId('start-promise').click()
        await tick()

        screen.getByTestId('resolve').click()
        await tick()
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('success')

        await advanceTime(1000)
        expect(screen.queryByTestId('root')).toBeNull()
      })

      it('auto-dismisses error toast after default timeout when promise rejects', async () => {
        render(PromiseToast, { timeout: 1000 })
        screen.getByTestId('start-reject').click()
        await tick()

        screen.getByTestId('reject').click()
        await tick()
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('error')

        await advanceTime(1000)
        expect(screen.queryByTestId('root')).toBeNull()
      })

      it('uses custom timeout from success options when promise resolves', async () => {
        render(PromiseCustomOptionsToast, { successTimeout: 2000 })
        fireEvent.click(screen.getByTestId('start-success-timeout'))
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('loading')

        fireEvent.click(screen.getByTestId('resolve'))
        await tick()
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('success')

        await advanceTime(1000)
        expect(screen.queryByTestId('root')).not.toBeNull()

        await advanceTime(1001)
        expect(screen.queryByTestId('root')).toBeNull()
      })

      it('uses custom timeout from error options when promise rejects', async () => {
        render(PromiseCustomOptionsToast, { errorTimeout: 3000 })
        fireEvent.click(screen.getByTestId('start-error-timeout'))
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('loading')

        fireEvent.click(screen.getByTestId('reject'))
        await tick()
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('error')

        await advanceTime(2000)
        expect(screen.queryByTestId('root')).not.toBeNull()

        await advanceTime(1001)
        expect(screen.queryByTestId('root')).toBeNull()
      })

      it('uses provider timeout when no custom timeout is specified', async () => {
        render(PromiseToast, { timeout: 1000 })
        fireEvent.click(screen.getByTestId('start-promise'))
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('loading')

        fireEvent.click(screen.getByTestId('resolve'))
        await tick()
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('success')

        await advanceTime(1000)
        expect(screen.queryByTestId('root')).toBeNull()
      })

      it('does not inherit a loading timeout when success does not specify one', async () => {
        render(PromiseLoadingTimeoutToast)
        fireEvent.click(screen.getByTestId('add-button'))
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('loading')

        await vi.advanceTimersByTimeAsync(1000)
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('success')

        await advanceTime(5000)
        expect(screen.queryByTestId('description')).toBeNull()
      })

      it('does not auto-dismiss when timeout is set to 0', async () => {
        render(PromiseCustomOptionsToast)
        fireEvent.click(screen.getByTestId('start-zero-success-timeout'))
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('loading')

        fireEvent.click(screen.getByTestId('resolve'))
        await tick()
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('success')

        await advanceTime(10000)
        expect(screen.queryByTestId('root')).not.toBeNull()
      })

      it('pauses timers when hovering over the toast', async () => {
        render(PromiseCustomOptionsToast, { successTimeout: 3000 })
        fireEvent.click(screen.getByTestId('start-success-timeout'))
        await tick()

        fireEvent.click(screen.getByTestId('resolve'))
        await tick()
        await tick()
        expect(screen.getByTestId('description')).toHaveTextContent('success')

        await advanceTime(1000)

        fireEvent.mouseMove(screen.getByTestId('root'))

        await advanceTime(5000)
        expect(screen.queryByTestId('root')).not.toBeNull()

        fireEvent.mouseLeave(screen.getByTestId('viewport'))
        await tick()

        await advanceTime(3100)
        expect(screen.queryByTestId('root')).toBeNull()
      })
    })
  })

  describe('update', () => {
    it('updates the toast', async () => {
      render(ToastManager)
      fireEvent.click(screen.getByTestId('add-button'))
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('Test Toast'))

      fireEvent.click(screen.getByTestId('update-button'))
      await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('updated'))
    })

    it('increments updateKey when updating a toast', async () => {
      render(ToastManager)
      fireEvent.click(screen.getByTestId('add-button'))
      await waitFor(() => expect(screen.getByTestId('update-key')).toHaveTextContent('0'))

      fireEvent.click(screen.getByTestId('update-button'))
      await waitFor(() => expect(screen.getByTestId('update-key')).toHaveTextContent('1'))
    })

    describe('timers', () => {
      withFakeTimers()

      it('auto-dismisses when timeout changes from 0 to a positive value', async () => {
        render(LoadingTypeToast)
        fireEvent.click(screen.getByTestId('add-loading'))
        await tick()
        expect(screen.getByTestId('title')).toHaveTextContent('loading')

        await advanceTime(5000)
        expect(screen.getByTestId('title')).toBeInTheDocument()

        fireEvent.click(screen.getByTestId('update-success'))
        await tick()
        expect(screen.getByTestId('title')).toHaveTextContent('success')

        await advanceTime(1000)
        expect(screen.queryByTestId('title')).toBeNull()
      })

      it('resets the auto-dismiss timer when updating with the same timeout value', async () => {
        render(ResetTimeoutToast)
        fireEvent.click(screen.getByTestId('add-button'))
        await tick()
        expect(screen.getByTestId('title')).toBeInTheDocument()

        await advanceTime(900)
        expect(screen.getByTestId('title')).toBeInTheDocument()

        fireEvent.click(screen.getByTestId('reset-button'))
        await tick()

        await advanceTime(200)
        expect(screen.getByTestId('title')).toBeInTheDocument()

        await advanceTime(800)
        expect(screen.queryByTestId('title')).toBeNull()
      })

      it('resets the auto-dismiss timer when updating from 0 to a timeout, then updating with the same timeout again', async () => {
        render(ResetTimeoutFromZeroToast)
        fireEvent.click(screen.getByTestId('add-button'))
        await tick()
        expect(screen.getByTestId('title')).toBeInTheDocument()

        fireEvent.click(screen.getByTestId('set-timeout'))
        await tick()

        await advanceTime(900)
        expect(screen.getByTestId('title')).toBeInTheDocument()

        fireEvent.click(screen.getByTestId('reset-timeout'))
        await tick()

        await advanceTime(200)
        expect(screen.getByTestId('title')).toBeInTheDocument()

        await advanceTime(800)
        expect(screen.queryByTestId('title')).toBeNull()
      })

      it('schedules a timer when updating a loading toast to a non-loading type', async () => {
        render(LoadingTypeToast)
        fireEvent.click(screen.getByTestId('add-loading'))
        await tick()
        expect(screen.getByTestId('title')).toHaveTextContent('loading')

        fireEvent.click(screen.getByTestId('update-success'))
        await tick()
        expect(screen.getByTestId('title')).toHaveTextContent('success')

        await advanceTime(1000)
        expect(screen.queryByTestId('title')).toBeNull()
      })

      it('does not clear the auto-dismiss timer when updated twice before a state update', async () => {
        render(LoadingTypeToast)
        fireEvent.click(screen.getByTestId('add-loading'))
        await tick()
        expect(screen.getByTestId('title')).toHaveTextContent('loading')

        fireEvent.click(screen.getByTestId('double-update'))
        await tick()
        expect(screen.getByTestId('title')).toHaveTextContent('new')

        await advanceTime(1000)
        expect(screen.queryByTestId('title')).toBeNull()
      })
    })
  })

  describe('close', () => {
    it('closes a toast', async () => {
      render(ToastManager)
      fireEvent.click(screen.getByTestId('add-button'))
      await waitFor(() => expect(screen.getByTestId('root')).toBeInTheDocument())

      fireEvent.click(screen.getByTestId('close-button'))
      await waitFor(() => expect(screen.queryByTestId('root')).toBeNull())
    })

    it('closes all toasts', async () => {
      render(ToastManager)
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByTestId('add-button'))
      }
      await waitFor(() => expect(screen.getAllByTestId('root')).toHaveLength(3))

      fireEvent.click(screen.getByTestId('close-all-button'))
      await waitFor(() => expect(screen.queryByTestId('root')).toBeNull())
    })

    it('does not call onClose when closing toasts that are already ending', async () => {
      const onClose1 = vi.fn()
      const onClose2 = vi.fn()
      render(OnCloseAlreadyEndingToast, { onClose1, onClose2 })
      fireEvent.click(screen.getByTestId('add-button'))
      await waitFor(() => expect(screen.getAllByTestId('root')).toHaveLength(2))

      fireEvent.click(screen.getByTestId('close-button'))

      expect(onClose1).toHaveBeenCalledTimes(1)
      expect(onClose2).toHaveBeenCalledTimes(1)
    })
  })

  describe('prop: timeout', () => {
    withFakeTimers()

    it('applies a changed timeout to toasts added afterwards', async () => {
      const { rerender } = render(ProviderTimeoutToast, { timeout: 5000 })

      await rerender({ timeout: 1000 })

      fireEvent.click(screen.getByTestId('add-button'))
      await tick()
      expect(screen.getByTestId('root')).toBeInTheDocument()

      await advanceTime(999)
      expect(screen.queryByTestId('root')).not.toBeNull()

      await advanceTime(2)
      expect(screen.queryByTestId('root')).toBeNull()
    })
  })

  describe('prop: limit', () => {
    it('marks toasts as limited when the limit is exceeded', async () => {
      render(LimitToast, { limit: 2 })
      const addButton = screen.getByTestId('add-button')

      await fireEvent.click(addButton)
      const toast1 = await screen.findByTestId('toast-1')
      expect(toast1).not.toHaveAttribute('data-limited')

      await fireEvent.click(addButton)
      expect(screen.getByTestId('toast-2')).not.toHaveAttribute('data-limited')

      await fireEvent.click(addButton)
      expect(screen.getByTestId('toast-3')).not.toHaveAttribute('data-limited')
      expect(toast1).toHaveAttribute('data-limited')
    })

    it('unmarks toasts as limited when the limit is not exceeded', async () => {
      render(LimitToast, { limit: 2 })
      const addButton = screen.getByTestId('add-button')

      await fireEvent.click(addButton)
      const toast1 = await screen.findByTestId('toast-1')

      await fireEvent.click(addButton)
      await fireEvent.click(addButton)
      expect(screen.getByTestId('toast-3')).not.toHaveAttribute('data-limited')
      expect(toast1).toHaveAttribute('data-limited')

      await fireEvent.click(screen.getByTestId('close-toast-3'))
      await waitFor(() => expect(toast1).not.toHaveAttribute('data-limited'))
    })

    it('preserves limited state when upserting a limited toast', async () => {
      render(LimitUpsertToast)

      fireEvent.click(screen.getByTestId('add-save'))
      const savingToast = await screen.findByTestId('Saving...')
      expect(savingToast).not.toHaveAttribute('data-limited')

      fireEvent.click(screen.getByTestId('add-other'))
      await waitFor(() => expect(savingToast).toHaveAttribute('data-limited'))
      expect(screen.getByTestId('Other toast')).not.toHaveAttribute('data-limited')

      fireEvent.click(screen.getByTestId('upsert-save'))
      await waitFor(() => expect(screen.getByTestId('Saved')).toBeInTheDocument())
      expect(screen.getByTestId('Saved')).toHaveAttribute('data-limited')
      expect(screen.getByTestId('Other toast')).not.toHaveAttribute('data-limited')
    })

    it('recomputes limited toasts when the limit prop changes', async () => {
      const { rerender } = render(LimitToast, { limit: 1 })

      const addButton = screen.getByTestId('add-button')
      fireEvent.click(addButton)
      fireEvent.click(addButton)

      const toast1 = await screen.findByTestId('toast-1')
      expect(screen.getByTestId('toast-2')).not.toHaveAttribute('data-limited')
      expect(toast1).toHaveAttribute('data-limited')

      await rerender({ limit: 2 })
      await waitFor(() => expect(toast1).not.toHaveAttribute('data-limited'))

      await rerender({ limit: 1 })
      await waitFor(() => expect(toast1).toHaveAttribute('data-limited'))
    })
  })

  describe('in dialog', () => {
    it('toasts in dialogs are accessible and not aria-hidden', async () => {
      render(DialogToast)

      fireEvent.click(screen.getByTestId('open-dialog'))
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

      fireEvent.click(screen.getByTestId('add'))

      const toastRoot = await screen.findByTestId('toast-root')
      expect(screen.getByTestId('toast-title')).toHaveTextContent('Toast in dialog')
      expect(screen.getByTestId('toast-description')).toHaveTextContent('This toast is in a dialog')
      expect(toastRoot).not.toHaveAttribute('aria-hidden', 'true')
    })

    it('high priority toasts in dialogs have correct accessibility structure', async () => {
      render(DialogToast, { open: true })

      fireEvent.click(screen.getByTestId('add-high'))

      const toastRoot = await screen.findByTestId('toast-root')
      await waitFor(() => expect(toastRoot).toHaveAttribute('aria-hidden', 'true'))
      expect(screen.queryByRole('alert')).not.toBeNull()
    })
  })
})
