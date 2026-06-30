<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import type { FieldValidator } from '$lib/components/field/field.svelte'

  let {
    validate,
    onValueChange
  }: { validate: FieldValidator; onValueChange: (value: string) => void } = $props()
</script>

<Form errors={{ message: 'Server error' }}>
  <Field.Root name="message" validationMode="onChange" {validate}>
    <Field.Control data-testid="control" {onValueChange} />
    <Field.Error />
  </Field.Root>
</Form>
