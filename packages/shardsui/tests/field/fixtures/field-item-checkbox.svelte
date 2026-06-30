<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let { onValueChange = undefined }: { onValueChange?: (value: string[]) => void } = $props()
</script>

<Field.Root name="apple">
  <CheckboxGroup value={[]} {onValueChange}>
    <Field.Item disabled>
      <Checkbox.Root value="fuji-apple" />
    </Field.Item>
    <Field.Item>
      <Checkbox.Root value="gala-apple" />
    </Field.Item>
  </CheckboxGroup>
</Field.Root>
