<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form errors={{ name: 'Server error' }}>
  <Field.Root name="name" disabled>
    <Field.Control data-testid="control" />
  </Field.Root>
</Form>
