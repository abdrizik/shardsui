<script lang="ts">
  import { attachElement } from '$lib/internal/attach-element'
  import type { PartProps } from '$lib/internal/types'
  import { DialogPortalContext, DialogContext, type DialogViewportState } from './context'

  type Props = PartProps<[DialogViewportState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const dialog = DialogContext.get()
  const portal = DialogPortalContext.getOr()

  const shouldRender = $derived(dialog.mounted || !!portal?.keepMounted)

  const dialogState: DialogViewportState = $derived({
    open: dialog.open,
    transitionStatus: dialog.transitionStatus,
    nested: dialog.nested,
    nestedDialogOpen: dialog.nestedOpenCount > 0
  })
</script>

{#if shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...dialog.transitionAttrs}
    {...dialog.nestedAttrs}
    {@attach attachElement((el) => (dialog.viewportElement = el))}
    hidden={!dialog.mounted}
    style:pointer-events={dialog.open ? null : 'none'}
    {style}
    role="presentation"
    {...rest}
  >
    {@render children?.(dialogState)}
  </svelte:element>
{/if}
