<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form errors={{}}>
  <Field.Root name="constructor">
    <Field.Control />
    <Field.Error data-testid="default-error" />
  </Field.Root>
</Form>
