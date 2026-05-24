<script lang="ts">
  import { registerLabelId } from '$lib/internal/register-label-id'
  import type { PartProps } from '$lib/internal/types'
  import { ProgressContext } from './context'
  import type { ProgressState } from './progress.svelte'

  type Props = PartProps<[ProgressState], 'span'>

  const uid = $props.id()

  let { as = 'span', ref = $bindable(null), id = uid, children, ...rest }: Props = $props()

  const progress = ProgressContext.get()
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...progress.stateAttrs}
  {@attach registerLabelId(progress, id)}
  {id}
  role="presentation"
  {...rest}
>
  {@render children?.(progress.state)}
</svelte:element>
