<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let { onCheckedChangeGala = undefined }: { onCheckedChangeGala?: (checked: boolean) => void } =
    $props()
</script>

<Field.Root name="apple">
  <CheckboxGroup value={['fuji-apple', 'gala-apple']}>
    <Field.Item>
      <Checkbox.Root value="fuji-apple" />
      <Field.Label data-testid="label">Fuji</Field.Label>
      <Field.Description data-testid="description"
        >A fuji apple is the round, edible fruit of an apple tree</Field.Description
      >
    </Field.Item>
    <Field.Item>
      <Checkbox.Root value="gala-apple" onCheckedChange={(c) => onCheckedChangeGala?.(c)} />
      <Field.Label data-testid="label">Gala</Field.Label>
      <Field.Description data-testid="description"
        >A gala apple is the round, edible fruit of an apple tree</Field.Description
      >
    </Field.Item>
  </CheckboxGroup>
</Field.Root>
