<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { untrack } from 'svelte'
  import type { Attachment } from 'svelte/attachments'
  import { ToastProviderContext, ToastContext, type ToastContentState } from './context'

  type Props = PartProps<[ToastContentState]>

  let { as = 'div', ref = $bindable(null), children, ...rest }: Props = $props()

  const toastRoot = ToastContext.get()
  const provider = ToastProviderContext.get()

  const observeHeight: Attachment<HTMLElement> = (node) => {
    // `recalculateHeight` reads the toast; tracking it here would tear down and rebuild both
    // observers on every transition status change.
    untrack(toastRoot.recalculateHeight)

    const resizeObserver = new ResizeObserver(() => toastRoot.recalculateHeight())
    const mutationObserver = new MutationObserver(() => toastRoot.recalculateHeight())

    resizeObserver.observe(node)
    mutationObserver.observe(node, {
      childList: true,
      subtree: true,
      characterData: true
    })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }

  const behind = $derived(provider.visibleIndexOf(toastRoot.toast.id) > 0)

  const toastState: ToastContentState = $derived({ expanded: provider.expanded, behind })

  const stateAttrs = $derived(dataAttrs({ expanded: provider.expanded, behind }))
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} {@attach observeHeight} {...rest}>
  {@render children?.(toastState)}
</svelte:element>
