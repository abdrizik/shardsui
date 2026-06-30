<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form errors={{ test: 'test' }}>
  <Field.Root name="test">
    <Checkbox.Root data-testid="checkbox" />
    <Field.Error data-testid="error" />
  </Field.Root>
</Form>
