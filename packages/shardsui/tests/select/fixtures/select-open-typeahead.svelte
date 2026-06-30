<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    onValueChange = undefined,
    onItemClick = undefined
  }: {
    onValueChange?: (value: unknown) => void
    onItemClick?: () => void
  } = $props()
</script>

<Select.Root open {onValueChange}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="one" onclick={() => onItemClick?.()}>Item One</Select.Item>
        <Select.Item value="two" onclick={() => onItemClick?.()}>Item Two</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
