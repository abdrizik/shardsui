<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable<string[] | null>([]),
    onValueChange = undefined,
    name = undefined,
    required = false
  }: {
    value?: string[] | null
    onValueChange?: (v: unknown) => void
    name?: string
    required?: boolean
  } = $props()
</script>

<Select.Root multiple {value} {onValueChange} {name} {required}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" placeholder="Pick options" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="a">Option A</Select.Item>
        <Select.Item value="b">Option B</Select.Item>
        <Select.Item value="c">Option C</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
