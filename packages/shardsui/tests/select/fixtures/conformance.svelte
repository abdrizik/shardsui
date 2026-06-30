<script lang="ts">
  import { Select } from '$lib/components/select'

  let { open = undefined, popupId = undefined }: { open?: boolean; popupId?: string } = $props()
</script>

<Select.Root {open}>
  <Select.Trigger data-testid="trigger">
    <Select.Value placeholder="Pick one" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup id={popupId} data-testid="popup">
        <Select.Item value="a">Option A</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
