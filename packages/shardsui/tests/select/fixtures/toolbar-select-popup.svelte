<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Toolbar } from '$lib/components/toolbar'

  let { onkeydown = undefined }: { onkeydown?: (event: KeyboardEvent) => void } = $props()
</script>

<Toolbar.Root {onkeydown}>
  <Select.Root value="a">
    <Select.Trigger data-testid="trigger">
      <Select.Value />
    </Select.Trigger>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="a">a</Select.Item>
        <Select.Item value="b">b</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Root>
  <Toolbar.Button data-testid="next">Next</Toolbar.Button>
</Toolbar.Root>
