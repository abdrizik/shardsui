<script lang="ts">
  import { Field, type FieldValidator } from '$lib/components/field'
  import { Form, type FormValidationMode } from '$lib/components/form'

  let {
    validate,
    validationMode = 'onBlur',
    validationDebounceTime,
    type = 'text',
    required,
    value,
    useForm = false
  }: {
    validate?: FieldValidator
    validationMode?: FormValidationMode
    validationDebounceTime?: number
    type?: string
    required?: boolean
    value?: string
    useForm?: boolean
  } = $props()
</script>

{#if useForm}
  <Form>
    <Field.Root {validate} {validationMode} {validationDebounceTime}>
      <Field.Label data-testid="label">Label</Field.Label>
      <Field.Control data-testid="control" {type} {required} {value} />
      <Field.Description data-testid="description">Description</Field.Description>
      <Field.Error data-testid="error" />
    </Field.Root>
    <button type="submit" data-testid="submit">submit</button>
  </Form>
{:else}
  <Field.Root {validate} {validationMode} {validationDebounceTime}>
    <Field.Label data-testid="label">Label</Field.Label>
    <Field.Control data-testid="control" {type} {required} {value} />
    <Field.Description data-testid="description">Description</Field.Description>
    <Field.Error data-testid="error" />
  </Field.Root>
{/if}
