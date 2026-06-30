<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let { validate }: { validate?: (value: unknown) => string | null } = $props()
</script>

<Field.Root name="protocols" validationMode="onChange" {validate}>
  <CheckboxGroup value={[]}>
    <Field.Item>
      <Checkbox.Root value="http" data-testid="cb-http" />
    </Field.Item>
    <Field.Item>
      <Checkbox.Root value="https" data-testid="cb-https" />
    </Field.Item>
  </CheckboxGroup>
</Field.Root>
