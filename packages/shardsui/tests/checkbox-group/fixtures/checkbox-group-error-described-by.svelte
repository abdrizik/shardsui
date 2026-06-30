<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
</script>

<Form errors={{ group: 'error' }}>
  <Field.Root name="group">
    <CheckboxGroup value={['one']}>
      <Field.Item>
        <Checkbox.Root value="one" />
        <Field.Description>Description</Field.Description>
      </Field.Item>
      <Field.Item>
        <Checkbox.Root value="two" />
      </Field.Item>
    </CheckboxGroup>
    <Field.Error data-testid="error" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
