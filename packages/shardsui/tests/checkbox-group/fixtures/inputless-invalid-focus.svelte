<script lang="ts">
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form>
  <Field.Root name="group" validate={() => 'Invalid group'}>
    <CheckboxGroup value={[]} />
  </Field.Root>
  <Field.Root name="email">
    <Field.Control required data-testid="email" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
