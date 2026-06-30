<script lang="ts">
  import { Select } from '$lib/components/select'

  let { open = $bindable(true) }: { open?: boolean } = $props()
</script>

<Select.Root {open} highlightItemOnHover={false}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="one">one</Select.Item>
        <Select.Item value="two">two</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
