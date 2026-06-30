<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
  }
</script>

<Form {onsubmit}>
  <Field.Root name="protocols">
    <CheckboxGroup value={[]}>
      <Field.Item>
        <Checkbox.Root value="https" data-testid="cb-enabled" required />
      </Field.Item>
      <Field.Item>
        <Checkbox.Root value="http" data-testid="cb-disabled" required disabled />
      </Field.Item>
    </CheckboxGroup>
    <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
  </Field.Root>
  <button type="submit">submit</button>
</Form>
