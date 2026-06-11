<script lang="ts">
  import { ItemIndicator } from '$lib/internal/item-indicator.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { CheckboxContext, type CheckboxState } from './context'
  import type { TransitionStatus } from '$lib/internal/transition-status.svelte'

  type Props = PartProps<[CheckboxState & { transitionStatus: TransitionStatus }], 'span'> & {
    keepMounted?: boolean
  }

  let {
    as = 'span',
    ref = $bindable(null),
    keepMounted = false,
    children,
    ...rest
  }: Props = $props()

  const checkbox = CheckboxContext.get()

  const indicator = new ItemIndicator(() => ({
    keepMounted,
    element: ref,
    open: checkbox.state.checked || checkbox.state.indeterminate
  }))
</script>

{#if indicator.shouldRender}
  <svelte:element
    this={as}
    bind:this={ref}
    {...checkbox.stateAttrs}
    {...indicator.stateAttrs}
    {...rest}
  >
    {@render children?.({ ...checkbox.state, transitionStatus: indicator.transitionStatus })}
  </svelte:element>
{/if}
