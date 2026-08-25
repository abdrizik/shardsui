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
    onValueChange
  }: {
    value?: string
    onValueChange?: (value: string | null) => void
  } = $props()
</script>

<Toolbar.Root>
  <Toolbar.Button data-testid="btn-before">Before</Toolbar.Button>
  <Select.Root bind:value {items} itemToStringLabel={(item) => item} {onValueChange}>
    <Select.Trigger data-testid="select-trigger">
      <Select.Value />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup data-testid="popup">
          <Select.Item value="a" data-testid="item-a">Option A</Select.Item>
          <Select.Item value="b" data-testid="item-b">Option B</Select.Item>
          <Select.Item value="c" data-testid="item-c">Option C</Select.Item>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
  <Toolbar.Button data-testid="btn-after">After</Toolbar.Button>
</Toolbar.Root>
