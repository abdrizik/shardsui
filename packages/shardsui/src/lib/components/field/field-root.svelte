<script lang="ts">
  import { FieldsetContext } from '$lib/components/fieldset/context'
  import { FormContext } from '$lib/components/form/context'
  import type { FormValidationMode } from '$lib/components/form/form.svelte'
  import type { PartProps } from '$lib/internal/types'
  import { FieldContext, type FieldRootState } from './context'
  import { LabelableContext } from '$lib/internal/labelable-context'
  import { FieldRoot, getFieldState, type FieldValidator } from './field.svelte'
  import { Labelable } from '$lib/internal/labelable.svelte'

  type Props = PartProps<[FieldRootState]> & {
    name?: string
    validate?: FieldValidator
    validationMode?: FormValidationMode
    validationDebounceTime?: number
    disabled?: boolean
    invalid?: boolean
    dirty?: boolean
    touched?: boolean
  }

  let {
    as = 'div',
    ref = $bindable(null),
    name,
    validate = () => null,
    validationMode,
    validationDebounceTime = 0,
    disabled = false,
    invalid,
    dirty,
    touched,
    children,
    ...rest
  }: Props = $props()

  const formRoot = FormContext.getOr()
  const fieldset = FieldsetContext.getOr()

  const field = new FieldRoot(() => ({
    name,
    validate,
    validationMode,
    validationDebounceTime,
    disabled,
    invalid,
    dirty,
    touched,
    fieldset,
    form: formRoot
  }))

  FieldContext.set(field)
  LabelableContext.set(new Labelable())

  const fieldState = $derived({ ...getFieldState(field), disabled: field.disabled })
</script>

<svelte:element this={as} bind:this={ref} {...field.stateAttrs} {...rest}>
  {@render children?.(fieldState)}
</svelte:element>
