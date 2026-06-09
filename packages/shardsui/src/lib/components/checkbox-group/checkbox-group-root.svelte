<script lang="ts">
  import { FieldContext } from '$lib/components/field/context'
  import { getFieldState, getFieldStateAttrs } from '$lib/components/field/field.svelte'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import { mergeDescribedBy } from '$lib/internal/labelable.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { CheckboxGroupRoot } from './checkbox-group.svelte'
  import { CheckboxGroupContext, type CheckboxGroupState } from './context'

  type Props = PartProps<[CheckboxGroupState]> & {
    value?: string[]
    disabled?: boolean
    onValueChange?: (value: string[]) => void
  }

  let {
    as = 'div',
    ref = $bindable(null),
    value = $bindable([]),
    disabled = false,
    onValueChange,
    'aria-describedby': ariaDescribedByProp,
    children,
    ...rest
  }: Props = $props()

  const uid = $props.id()

  const field = FieldContext.getOr()
  const labelable = LabelableContext.get()

  const checkboxGroup = new CheckboxGroupRoot(() => ({
    uid,
    value,
    setValue: (next) => (value = next),
    disabled,
    onValueChange
  }))

  CheckboxGroupContext.set(checkboxGroup)

  const ariaDescribedBy = $derived(mergeDescribedBy(ariaDescribedByProp, labelable.messageIds))

  const checkboxGroupState = $derived<CheckboxGroupState>({
    ...getFieldState(field),
    disabled: checkboxGroup.disabled
  })

  const stateAttrs = $derived(
    dataAttrs({ disabled: checkboxGroup.disabled, ...getFieldStateAttrs(field) })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  role="group"
  aria-labelledby={labelable.labelId}
  aria-describedby={ariaDescribedBy}
  {...rest}
>
  {@render children?.(checkboxGroupState)}
</svelte:element>
