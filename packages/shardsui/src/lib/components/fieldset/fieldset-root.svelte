<script lang="ts">
  import type { PartProps } from '$lib/internal/types'
  import { FieldsetContext, type FieldsetState } from './context'
  import { FieldsetRoot } from './fieldset.svelte'

  type Props = PartProps<[FieldsetState], 'fieldset'> & {
    disabled?: boolean
  }

  let {
    as = 'fieldset',
    ref = $bindable(null),
    disabled = false,
    children,
    ...rest
  }: Props = $props()

  const parent = FieldsetContext.getOr()

  const fieldset = new FieldsetRoot(() => ({
    disabled: disabled || (parent?.disabled ?? false)
  }))

  FieldsetContext.set(fieldset)
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...fieldset.stateAttrs}
  {...{ disabled: fieldset.disabled || undefined }}
  aria-labelledby={fieldset.labelId}
  {...rest}
>
  {@render children?.(fieldset.state)}
</svelte:element>
