<script lang="ts">
  import { Select } from '$lib/components/select'
</script>

<Select.Root open>
  <Select.Trigger data-testid="trigger">Open</Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup data-testid="popup">
        <Select.ScrollUpArrow keepMounted data-testid="up" />
        <Select.ScrollDownArrow keepMounted data-testid="down" />
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
