<script lang="ts" generics="FormValues extends Record<string, unknown> = Record<string, unknown>">
  import type { PartProps } from '$lib/internal/types'
  import { FormContext } from './context'
  import { FormRoot, type FormErrors, type FormValidationMode } from './form.svelte'

  type Props = PartProps<[], 'form'> & {
    validationMode?: FormValidationMode
    errors?: FormErrors
    onFormSubmit?: (values: FormValues) => void
  }

  let {
    as = 'form',
    ref = $bindable(null),
    validationMode = 'onSubmit',
    errors: externalErrors,
    onsubmit,
    onFormSubmit,
    children,
    ...rest
  }: Props = $props()

  const form = new FormRoot(() => ({
    validationMode,
    externalErrors,
    element: ref,
    onsubmit,
    onFormSubmit: onFormSubmit as ((values: Record<string, unknown>) => void) | undefined
  }))

  FormContext.set(form)

  export function validate(fieldName?: string) {
    form.validate(fieldName)
  }
</script>

<svelte:element this={as} bind:this={ref} novalidate onsubmit={form.onsubmit} {...rest}>
  {@render children?.()}
</svelte:element>
