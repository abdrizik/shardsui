<script lang="ts">
  import { Select } from '$lib/components/select'

  // `open` never accepts writes from the component: the setter half of the function
  // binding drops them, which is how a strictly controlled overlay is expressed.
  let {
    open = false,
    onOpenChange = undefined
  }: {
    open?: boolean
    onOpenChange?: (open: boolean) => void
  } = $props()
</script>

<Select.Root bind:open={() => open, (next: boolean) => onOpenChange?.(next)}>
  <Select.Trigger data-testid="trigger">
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="a">a</Select.Item>
        <Select.Item value="b">b</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
