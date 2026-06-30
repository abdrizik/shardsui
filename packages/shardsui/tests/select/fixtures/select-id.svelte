<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    id = undefined,
    name = undefined
  }: {
    id?: string
    name?: string
  } = $props()
</script>

<Select.Root {id} {name}>
  <Select.Trigger>
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
