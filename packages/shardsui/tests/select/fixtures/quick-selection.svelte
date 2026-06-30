<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    highlightItemOnHover = true,
    onItemOneClick = undefined,
    onValueChange = undefined,
    oneDisabled = false
  }: {
    highlightItemOnHover?: boolean
    onItemOneClick?: (event: MouseEvent) => void
    onValueChange?: (value: unknown) => void
    oneDisabled?: boolean
  } = $props()
</script>

<Select.Root {highlightItemOnHover} {onValueChange}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" placeholder="Select font" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="one" disabled={oneDisabled} onclick={onItemOneClick}>one</Select.Item>
        <Select.Item value="two">two</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
