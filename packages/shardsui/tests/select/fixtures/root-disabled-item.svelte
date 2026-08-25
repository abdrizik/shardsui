<script lang="ts">
  import { Select } from '$lib/components/select'

  let { onitemclick = undefined }: { onitemclick?: (event: MouseEvent) => void } = $props()
</script>

<Select.Root open disabled>
  <Select.Trigger>
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="one" onclick={onitemclick}>one</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
