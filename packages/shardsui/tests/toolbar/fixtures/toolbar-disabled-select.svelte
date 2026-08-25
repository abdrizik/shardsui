<script lang="ts">
  import { Toolbar } from '$lib/components/toolbar'
  import { Select } from '$lib/components/select'

  const items = [
    { label: 'a', value: 'a' },
    { label: 'b', value: 'b' },
    { label: 'c', value: 'c' }
  ]

  let {
    value = $bindable('a'),
    onValueChange,
    onOpenChange
  }: {
    value?: string
    onValueChange?: (value: string | null) => void
    onOpenChange?: (open: boolean) => void
  } = $props()
</script>

<Toolbar.Root>
  <Select.Root bind:value {items} itemToStringLabel={(item) => item} {onValueChange} {onOpenChange}>
    <Select.Trigger data-testid="select-trigger" disabled as="span">
      <Select.Value />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          <Select.Item value="a" data-testid="item-a">Option A</Select.Item>
          <Select.Item value="b" data-testid="item-b">Option B</Select.Item>
          <Select.Item value="c" data-testid="item-c">Option C</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</Toolbar.Root>
