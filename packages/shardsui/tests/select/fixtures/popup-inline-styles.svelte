<script lang="ts">
  import { Select } from '$lib/components/select'
</script>

<Select.Root open>
  <Select.Trigger>Trigger</Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup
        data-testid="popup"
        style="transform: translateX(10px); scale: 0.8; translate: 1px 2px;"
      >
        <Select.Item value="1">Item 1</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
