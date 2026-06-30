<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
</script>

<Form>
  <Field.Root name="group">
    <CheckboxGroup value={['one']}>
      <Field.Item>
        <Checkbox.Root value="one" data-testid="checkbox" />
      </Field.Item>
      <Field.Item>
        <Checkbox.Root value="two" data-testid="checkbox" required />
      </Field.Item>
    </CheckboxGroup>
    <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
