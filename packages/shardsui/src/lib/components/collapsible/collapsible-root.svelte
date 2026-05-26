<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { CollapsibleRoot, type CollapsibleState } from './collapsible.svelte'
  import { CollapsibleContext } from './context'

  type Props = PartProps<[CollapsibleState]> & {
    open?: boolean
    disabled?: boolean
    onOpenChange?: (open: boolean) => void
  }

  let {
    as = 'div',
    ref = $bindable(null),
    open = $bindable(false),
    disabled = false,
    onOpenChange,
    children,
    ...rest
  }: Props = $props()

  const collapsible = new CollapsibleRoot(() => ({
    open,
    setOpen: (next) => {
      onOpenChange?.(next)
      open = next
    },
    disabled
  }))

  CollapsibleContext.set(collapsible)

  const stateAttrs = $derived(
    dataAttrs({
      'starting-style': collapsible.transitionStatus === 'starting',
      'ending-style': collapsible.transitionStatus === 'ending'
    })
  )
</script>

<svelte:element this={as} bind:this={ref} {...collapsible.stateAttrs} {...stateAttrs} {...rest}>
  {@render children?.(collapsible.state)}
</svelte:element>
