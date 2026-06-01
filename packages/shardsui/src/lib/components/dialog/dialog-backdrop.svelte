<script lang="ts">
  import type { AnchoredBackdropState } from '$lib/internal/anchored-state'
  import { attachElement } from '$lib/internal/attach-element'
  import type { PartProps } from '$lib/internal/types'
  import { DialogContext } from './context'

  type Props = PartProps<[AnchoredBackdropState]>

  let { as = 'div', ref = $bindable(null), style, children, ...rest }: Props = $props()

  const dialog = DialogContext.get()

  const dialogState: AnchoredBackdropState = $derived({
    open: dialog.open,
    transitionStatus: dialog.transitionStatus
  })
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...dialog.transitionAttrs}
  {...dialog.nestedAttrs}
  {@attach attachElement((el) => (dialog.backdropElement = el))}
  hidden={!dialog.mounted}
  style:user-select="none"
  style:-webkit-user-select="none"
  {style}
  role="presentation"
  {...rest}
>
  {@render children?.(dialogState)}
</svelte:element>
