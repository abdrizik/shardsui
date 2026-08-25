<script lang="ts">
  import { Select } from '$lib/components/select'
  import DialogArrangements from './dialog-arrangements.svelte'

  let {
    arrangement = 'contained'
  }: { arrangement?: 'contained' | 'detached' | 'multiple-detached' } = $props()
</script>

<DialogArrangements {arrangement}>
  <Select.Root>
    <Select.Trigger data-testid="select-trigger">Open select</Select.Trigger>
    <Select.Portal>
      <Select.Positioner data-testid="select-positioner">
        <Select.Popup>
          <Select.Item value="a">Item</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</DialogArrangements>
