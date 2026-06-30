<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form>
  <Field.Root name="group" validate={() => 'Invalid group'}>
    <CheckboxGroup value={[]}>
      <Checkbox.Root value="one" disabled />
    </CheckboxGroup>
  </Field.Root>
  <Field.Root name="email">
    <Field.Control required data-testid="email" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
