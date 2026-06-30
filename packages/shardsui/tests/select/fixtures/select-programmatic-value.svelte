<script lang="ts">
  import { Select } from '$lib/components/select'

  let withItems = $state<string | null>(null)
  let withoutItems = $state<string | null>(null)
</script>

<button
  type="button"
  onclick={() => {
    withItems = 'b'
    withoutItems = 'b'
  }}
>
  set
</button>

<Select.Root items={{ a: 'Apple', b: 'Banana' }} bind:value={withItems}>
  <Select.Trigger>
    <Select.Value data-testid="items-value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="a">Apple</Select.Item>
        <Select.Item value="b">Banana</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>

<Select.Root bind:value={withoutItems}>
  <Select.Trigger>
    <Select.Value data-testid="plain-value" />
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
