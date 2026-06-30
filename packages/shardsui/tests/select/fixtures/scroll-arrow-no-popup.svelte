<script lang="ts">
  import { Select } from '$lib/components/select'
</script>

<Select.Root open>
  <Select.Trigger data-testid="trigger">Open</Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.ScrollDownArrow keepMounted data-testid="down" />
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
