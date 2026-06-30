<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let disabled = $state(false)

  function validate(nextValue: unknown) {
    return (nextValue as string[]).length < 2 ? 'pick two' : null
  }
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
