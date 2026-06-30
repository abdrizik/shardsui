<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'
  import { Form, type FormValidationMode } from '$lib/components/form'

  let {
    validationMode = 'onBlur',
    validate = undefined,
    required = false,
    invalid = false,
    useForm = false
  }: {
    validationMode?: FormValidationMode
    validate?: (val: unknown) => string | null
    required?: boolean
    invalid?: boolean
    useForm?: boolean
  } = $props()
</script>

{#if useForm}
  <Form>
    <Field.Root {validationMode} {validate} {invalid}>
      <Checkbox.Root data-testid="checkbox" {required} />
      <Field.Description data-testid="description">Description</Field.Description>
      <Field.Error data-testid="error" />
    </Field.Root>
    <button type="submit" data-testid="submit">submit</button>
  </Form>
{:else}
  <Field.Root {validationMode} {validate} {invalid}>
    <Checkbox.Root data-testid="checkbox" {required} />
    <Field.Description data-testid="description">Description</Field.Description>
    <Field.Error data-testid="error" />
  </Field.Root>
{/if}
