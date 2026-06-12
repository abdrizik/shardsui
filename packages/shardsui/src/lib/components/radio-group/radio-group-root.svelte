<script lang="ts" generics="Value = unknown">
  import { FieldContext } from '$lib/components/field/context'
  import {
    getFieldAriaInvalid,
    getFieldState,
    getFieldStateAttrs
  } from '$lib/components/field/field.svelte'
  import { FieldsetContext } from '$lib/components/fieldset/context'
  import { chain } from '$lib/internal/chain'
  import { dataAttrs } from '$lib/internal/data-attrs'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import { mergeDescribedBy } from '$lib/internal/labelable.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { RadioGroupContext, type RadioGroupState } from './context'
  import { RadioGroupRoot } from './radio-group.svelte'

  type Props = PartProps<[RadioGroupState]> & {
    value?: Value
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    name?: string
    form?: string
    onValueChange?: (value: Value) => void
  }

  let {
    as = 'div',
    ref = $bindable(null),
    value = $bindable(),
    disabled = false,
    readOnly = false,
    required = false,
    name,
    form,
    onValueChange,
    onkeydowncapture,
    onkeydown,
    onfocusin,
    onfocusout,
    'aria-describedby': ariaDescribedByProp,
    children,
    ...rest
  }: Props = $props()

  const uid = $props.id()

  const field = FieldContext.getOr()
  const fieldset = FieldsetContext.getOr()
  const labelable = LabelableContext.get()

  const radioGroup = new RadioGroupRoot<Value>(() => ({
    uid,
    value,
    setValue: (next) => (value = next),
    disabled,
    readOnly,
    required,
    name,
    form,
    onValueChange,
    ref
  }))

  RadioGroupContext.set(radioGroup)

  const ariaLabelledBy = $derived(labelable.labelId ?? fieldset?.labelId)
  const ariaDescribedBy = $derived(mergeDescribedBy(ariaDescribedByProp, labelable.messageIds))
  const ariaInvalid = $derived(getFieldAriaInvalid(field, radioGroup.disabled))

  const radioGroupState = $derived<RadioGroupState>({
    ...getFieldState(field),
    disabled: radioGroup.disabled,
    readOnly: radioGroup.readOnly,
    required: radioGroup.required
  })

  const stateAttrs = $derived(
    dataAttrs({
      disabled: radioGroup.disabled,
      readonly: radioGroup.readOnly,
      required: radioGroup.required,
      ...getFieldStateAttrs(field)
    })
  )
</script>

<svelte:element
  this={as}
  bind:this={ref}
  {...stateAttrs}
  role="radiogroup"
  aria-required={radioGroup.required || undefined}
  aria-disabled={radioGroup.disabled || undefined}
  aria-readonly={radioGroup.readOnly || undefined}
  aria-labelledby={ariaLabelledBy}
  aria-describedby={ariaDescribedBy}
  aria-invalid={ariaInvalid}
  onkeydowncapture={chain(onkeydowncapture, radioGroup.onkeydowncapture)}
  onkeydown={chain(onkeydown, radioGroup.composite.onkeydown)}
  onfocusin={chain(onfocusin, radioGroup.onfocusin)}
  onfocusout={chain(onfocusout, radioGroup.onfocusout)}
  {...rest}
>
  {@render children?.(radioGroupState)}
</svelte:element>
