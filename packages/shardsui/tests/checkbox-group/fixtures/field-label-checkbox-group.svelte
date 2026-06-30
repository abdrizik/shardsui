<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let {
    onCheckedChangeGrannySmith = undefined
  }: { onCheckedChangeGrannySmith?: (checked: boolean) => void } = $props()
</script>

<Field.Root name="apple">
  <CheckboxGroup value={['fuji-apple', 'gala-apple']}>
    <Field.Item>
      <Field.Label data-testid="label">
        <Checkbox.Root value="fuji-apple" />
        Fuji
      </Field.Label>
    </Field.Item>
    <Field.Item>
      <Field.Label data-testid="label">
        <Checkbox.Root value="gala-apple" />
        Gala
      </Field.Label>
    </Field.Item>
    <Field.Item>
      <Field.Label data-testid="label">
        <Checkbox.Root value="granny-smith-apple" onCheckedChange={onCheckedChangeGrannySmith} />
        Granny Smith
      </Field.Label>
    </Field.Item>
  </CheckboxGroup>
</Field.Root>
