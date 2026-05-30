<script lang="ts">
  import type { Snippet } from 'svelte'
  import { ToastProviderContext } from './context'
  import type { ToastManager } from './manager'
  import { ToastProvider } from './toast.svelte'

  type Props = {
    timeout?: number
    limit?: number
    toastManager?: ToastManager
    children?: Snippet
  }

  let { timeout = 5000, limit = 3, toastManager, children }: Props = $props()

  const provider = new ToastProvider(() => ({ timeout, limit }))
  ToastProviderContext.set(provider)

  $effect(() => {
    if (!toastManager) return

    return toastManager.subscribe((event) => {
      if (event.action === 'promise') {
        provider.promise(event.options.promise, event.options)
      } else if (event.action === 'update') {
        provider.update(event.options.id, event.options)
      } else if (event.action === 'close') {
        provider.close(event.options.id)
      } else {
        provider.add(event.options)
      }
    })
  })
</script>

{@render children?.()}
