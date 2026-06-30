<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    timeout = 5000,
    successTimeout = undefined,
    errorTimeout = undefined
  }: {
    timeout?: number
    successTimeout?: number
    errorTimeout?: number
  } = $props()

  const manager = new Toast.Manager()

  let resolvePromise = $state<((v: string) => void) | null>(null)
  let rejectPromise = $state<((e: Error) => void) | null>(null)

  function startCustomLoading() {
    const p = new Promise<string>((res) => {
      resolvePromise = res
    })
    manager
      .promise(p, {
        loading: { title: 'loading title', description: 'loading description' },
        success: 'success',
        error: 'error'
      })
      .catch(() => {})
  }

  function startWithSuccessTimeout() {
    const p = new Promise<string>((res) => {
      resolvePromise = res
    })
    manager
      .promise(p, {
        loading: 'loading',
        success: { description: 'success', timeout: successTimeout ?? 2000 },
        error: 'error'
      })
      .catch(() => {})
  }

  function startWithErrorTimeout() {
    const p = new Promise<string>((_, rej) => {
      rejectPromise = rej
    })
    manager
      .promise(p, {
        loading: 'loading',
        success: 'success',
        error: { description: 'error', timeout: errorTimeout ?? 3000 }
      })
      .catch(() => {})
  }

  function startWithSuccessOptionsFn() {
    const p = new Promise<string>((res) => {
      resolvePromise = res
    })
    manager
      .promise(p, {
        loading: 'loading',
        success: (data) => ({ title: `saved ${data}`, description: 'done', timeout: 2000 }),
        error: 'error'
      })
      .catch(() => {})
  }

  function startWithZeroSuccessTimeout() {
    const p = new Promise<string>((res) => {
      resolvePromise = res
    })
    manager
      .promise(p, {
        loading: 'loading',
        success: { description: 'success', timeout: 0 },
        error: 'error'
      })
      .catch(() => {})
  }

  function doResolve() {
    resolvePromise?.('test success')
  }

  function doReject() {
    rejectPromise?.(new Error('test error'))
  }
</script>

<Toast.Provider toastManager={manager} {timeout}>
  <button type="button" data-testid="start-custom-loading" onclick={startCustomLoading}>
    start custom loading
  </button>
  <button type="button" data-testid="start-success-timeout" onclick={startWithSuccessTimeout}>
    start success timeout
  </button>
  <button type="button" data-testid="start-error-timeout" onclick={startWithErrorTimeout}>
    start error timeout
  </button>
  <button type="button" data-testid="start-success-options-fn" onclick={startWithSuccessOptionsFn}>
    start success options fn
  </button>
  <button
    type="button"
    data-testid="start-zero-success-timeout"
    onclick={startWithZeroSuccessTimeout}
  >
    start zero success timeout
  </button>
  <button type="button" data-testid="resolve" onclick={doResolve}>resolve</button>
  <button type="button" data-testid="reject" onclick={doReject}>reject</button>

  <Toast.Viewport data-testid="viewport">
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title">{toast.title ?? ''}</Toast.Title>
        <Toast.Description data-testid="description">{toast.description ?? ''}</Toast.Description>
        <Toast.Close aria-label="close-press" />
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
