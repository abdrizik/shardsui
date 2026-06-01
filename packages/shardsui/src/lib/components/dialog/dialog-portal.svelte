<script lang="ts">
  import type { Snippet } from 'svelte'
  import { portalTo } from '$lib/internal/floating/portal'
  import { DialogContext, DialogPortalContext } from './context'
  import InternalBackdrop from '$lib/internal/internal-backdrop.svelte'

  type Props = {
    ref?: HTMLDivElement | null
    container?: HTMLElement | null
    keepMounted?: boolean
    children?: Snippet
  }

  let { ref = $bindable(null), container, keepMounted = false, children }: Props = $props()

  const dialog = DialogContext.get()

  const shouldRender = $derived(dialog.mounted || keepMounted)
  const backdropVisible = $derived(dialog.mounted && dialog.modal === true)

  DialogPortalContext.set({
    get keepMounted() {
      return keepMounted
    }
  })
</script>

{#if shouldRender}
  <div bind:this={ref} {@attach portalTo(container)} data-shards-ui-portal>
    {#if backdropVisible}
      <InternalBackdrop bind:ref={dialog.internalBackdropElement} inert={!dialog.open} />
    {/if}
    {@render children?.()}
  </div>
{/if}
