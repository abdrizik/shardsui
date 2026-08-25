<script lang="ts">
  import { Field, type FieldValidator } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let disabled = $state(false)

  const validate: FieldValidator = (nextValue) =>
    Array.isArray(nextValue) && nextValue.length >= 2 ? null : 'pick two'
</script>

<Field.Root name="protocols" validationMode="onChange" {validate}>
  <CheckboxGroup value={[]}>
    <Field.Item>
      <Checkbox.Root value="http" data-testid="cb-http" {disabled} />
    </Field.Item>
    <Field.Item>
      <Checkbox.Root value="https" data-testid="cb-https" />
    </Field.Item>
  </CheckboxGroup>
  <button type="button" onclick={() => (disabled = true)}>disable</button>
</Field.Root>
