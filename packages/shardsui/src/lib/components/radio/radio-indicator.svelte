<script lang="ts">
  import { ItemIndicator } from '$lib/internal/item-indicator.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { RadioContext, type RadioState } from './context'
  import type { TransitionStatus } from '$lib/internal/transition-status.svelte'

  type Props = PartProps<[RadioState & { transitionStatus: TransitionStatus }], 'span'> & {
    keepMounted?: boolean
  }

  let {
    as = 'span',
    ref = $bindable(null),
    keepMounted = false,
    children,
    ...rest
  }: Props = $props()

  const radio = RadioContext.get()

  const indicator = new ItemIndicator(() => ({
    keepMounted,
    element: ref,
    open: radio.state.checked
  }))
</script>

{#if indicator.shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...radio.stateAttrs}
    {...indicator.stateAttrs}
    {...rest}
  >
    {@render children?.({ ...radio.state, transitionStatus: indicator.transitionStatus })}
  </svelte:element>
{/if}
