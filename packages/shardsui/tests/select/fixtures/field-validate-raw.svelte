<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field, type FieldValidator } from '$lib/components/field'

  type Item = { code: string; label: string }

  let {
    items = [
      { code: 'US', label: 'United States' },
      { code: 'CA', label: 'Canada' }
    ],
    validate
  }: {
    items?: Item[]
    validate?: FieldValidator
  } = $props()
</script>

<Field.Root validationMode="onBlur" {validate}>
  <Select.Root
    value={items[0]}
    itemToStringLabel={(item: Item) => item.label}
    itemToStringValue={(item: Item) => item.code}
  >
    <Select.Trigger data-testid="trigger">
      <Select.Value />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner />
    </Select.Portal>
  </Select.Root>
</Field.Root>
