<script lang="ts">
  import type { Side } from '$lib/internal/floating/anchor-positioning.svelte'
  import { Select } from '$lib/components/select'

  let {
    side = 'right'
  }: {
    side?: Side
  } = $props()
</script>

<Select.Root>
  <Select.Trigger data-testid="trigger">Trigger</Select.Trigger>
  <Select.Portal>
    <Select.Positioner {side}>
      <Select.Popup>
        <Select.Item value="apple">apple</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
