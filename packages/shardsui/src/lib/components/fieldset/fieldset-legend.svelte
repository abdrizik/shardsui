<script lang="ts">
  import { registerLabelId } from '$lib/internal/register-label-id'
  import type { PartProps } from '$lib/internal/types'
  import { FieldsetContext, type FieldsetState } from './context'

  type Props = PartProps<[FieldsetState]>

  const uid = $props.id()

  let { as = 'div', ref = $bindable(null), id = uid, children, ...rest }: Props = $props()

  const fieldset = FieldsetContext.get()
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...fieldset.stateAttrs}
  {@attach registerLabelId(fieldset, id)}
  {id}
  {...rest}
>
  {@render children?.(fieldset.state)}
</svelte:element>
