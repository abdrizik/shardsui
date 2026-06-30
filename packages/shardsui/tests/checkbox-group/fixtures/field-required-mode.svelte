<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let { validationMode = 'onChange' }: { validationMode?: 'onSubmit' | 'onBlur' | 'onChange' } =
    $props()
</script>

<Field.Root name="protocols" {validationMode}>
  <CheckboxGroup value={[]}>
    <Field.Item>
      <Checkbox.Root value="http" data-testid="cb-http" required />
    </Field.Item>
    <Field.Item>
      <Checkbox.Root value="https" data-testid="cb-https" required />
    </Field.Item>
  </CheckboxGroup>
  <Field.Error match="valueMissing" data-testid="error">required</Field.Error>
</Field.Root>
