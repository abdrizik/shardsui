<script lang="ts">
  import { Form, type FormValidationMode } from '$lib/components/form'
  import { Field, type FieldValidator, type FieldValidityState } from '$lib/components/field'

  let {
    onValidity,
    validate,
    validationMode,
    required = false,
    withForm = false
  }: {
    onValidity: (data: FieldValidityState) => void
    validate?: FieldValidator
    validationMode?: FormValidationMode
    required?: boolean
    withForm?: boolean
  } = $props()
</script>

{#snippet field()}
  <Field.Root {validate} {validationMode}>
    <Field.Control {required} data-testid="control" />
    <Field.Validity>
      {#snippet children(data)}
        {onValidity(data)}
      {/snippet}
    </Field.Validity>
  </Field.Root>
{/snippet}

{#if withForm}
  <Form>
    {@render field()}
    <button type="submit">submit</button>
  </Form>
{:else}
  {@render field()}
{/if}
