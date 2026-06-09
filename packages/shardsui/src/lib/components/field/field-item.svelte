<script lang="ts">
  import { dataAttrs } from '$lib/internal/data-attrs'
  import type { PartProps } from '$lib/internal/types'
  import { FieldItemContext, FieldContext, type FieldRootState } from './context'
  import { getFieldState, getFieldStateAttrs } from './field.svelte'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import { Labelable } from '$lib/internal/labelable.svelte'

  type Props = PartProps<[FieldRootState]> & {
    disabled?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    disabled: disabledProp = false,
    children,
    ...rest
  }: Props = $props()

  const field = FieldContext.get()
  const labelable = LabelableContext.get()

  const disabled = $derived(field.disabled || disabledProp)

  FieldItemContext.set({
    get disabled() {
      return disabled
    }
  })
  LabelableContext.set(new Labelable(labelable))

  const fieldState = $derived({ ...getFieldState(field), disabled })

  const stateAttrs = $derived(dataAttrs({ disabled, ...getFieldStateAttrs(field) }))
</script>

<svelte:element this={as} bind:this={ref} {...stateAttrs} {...rest}>
  {@render children?.(fieldState)}
</svelte:element>
