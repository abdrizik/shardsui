<script lang="ts">
  import { Toast } from '$lib/components/toast'

  let {
    timeout = 5000
  }: {
    timeout?: number
  } = $props()

  const manager = new Toast.Manager()

  let resolvePromise = $state<((v: string) => void) | null>(null)
  let rejectPromise = $state<((e: Error) => void) | null>(null)

  function startPromise(successMsg: string, errorMsg: string, _reject = false) {
    const p = new Promise<string>((res, rej) => {
      resolvePromise = res
      rejectPromise = rej
    })

    manager
      .promise(p, {
        loading: 'loading',
        success: successMsg,
        error: errorMsg
      })
      .catch(() => {})
  }

  function startPromiseWithFn() {
    const p = new Promise<string>((res) => {
      resolvePromise = res
    })
    manager
      .promise(p, {
        loading: 'loading',
        success: (data) => `${data}`,
        error: 'error'
      })
      .catch(() => {})
  }

  function startErrorWithFn() {
    const p = new Promise<string>((_, rej) => {
      rejectPromise = rej
    })
    manager
      .promise(p, {
        loading: 'loading',
        success: 'success',
        error: (err: unknown) => `${err instanceof Error ? err.message : String(err)}`
      })
      .catch(() => {})
  }

  function doResolve() {
    resolvePromise?.('test success')
  }

  function doReject() {
    rejectPromise?.(new Error('test error'))
  }

  function closeToast() {
    manager.close()
  }
</script>

<Toast.Provider toastManager={manager} {timeout}>
  <button type="button" data-testid="start-promise" onclick={() => startPromise('success', 'error')}
    >start promise</button
  >
  <button
    type="button"
    data-testid="start-reject"
    onclick={() => startPromise('success', 'error', true)}>start reject</button
  >
  <button type="button" data-testid="start-fn-success" onclick={startPromiseWithFn}
    >start fn success</button
  >
  <button type="button" data-testid="start-fn-error" onclick={startErrorWithFn}
    >start fn error</button
  >
  <button type="button" data-testid="resolve" onclick={doResolve}>resolve</button>
  <button type="button" data-testid="reject" onclick={doReject}>reject</button>
  <button type="button" data-testid="close-all" onclick={closeToast}>close all</button>

  <Toast.Viewport>
    {#each Toast.getToastManager().toasts as toast (toast.id)}
      <Toast.Root {toast} data-testid="root">
        <Toast.Title data-testid="title">{toast.title}</Toast.Title>
        <Toast.Description data-testid="description">{toast.description ?? ''}</Toast.Description>
        <Toast.Close aria-label="close-press" />
        <span data-testid="type">{toast.type ?? ''}</span>
      </Toast.Root>
    {/each}
  </Toast.Viewport>
</Toast.Provider>
