<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field, type FieldValidator } from '$lib/components/field'

  let {
    validate
  }: {
    validate?: FieldValidator
  } = $props()
</script>

<Field.Root validationMode="onChange" {validate}>
  <Select.Root name="country">
    <Select.Trigger data-testid="trigger">
      <Select.Value />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          <Select.Item value="US">United States</Select.Item>
          <Select.Item value="CA">Canada</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</Field.Root>
