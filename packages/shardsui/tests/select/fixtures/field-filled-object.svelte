<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field } from '$lib/components/field'

  type Item = { id: number; label: string }

  const emptyValue: Item = { id: 1, label: 'Empty option' }
</script>

<Field.Root>
  <Select.Root
    value={emptyValue}
    itemToStringLabel={(item: Item) => item.label}
    itemToStringValue={() => ''}
  >
    <Select.Trigger data-testid="trigger" />
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          <Select.Item value={emptyValue}>Empty option</Select.Item>
          <Select.Item value={{ id: 2, label: 'Option 1' }}>Option 1</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</Field.Root>
