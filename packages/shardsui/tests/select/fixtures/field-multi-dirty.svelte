<script lang="ts">
  import { Select } from '$lib/components/select'
  import { Field } from '$lib/components/field'

  let {
    mode = 'string',
    value = $bindable(),
    open = $bindable(true),
    isItemEqualToValue = undefined
  }: {
    mode?: 'string' | 'object'
    value?: unknown[]
    open?: boolean
    isItemEqualToValue?: (a: unknown, b: unknown) => boolean
  } = $props()

  const objItems = [
    { value: 'a', label: 'a' },
    { value: 'b', label: 'b' }
  ]
</script>

<Field.Root>
  <Select.Root multiple bind:open {value} {isItemEqualToValue}>
    <Select.Trigger data-testid="trigger">
      <Select.Value />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          {#if mode === 'object'}
            {#each objItems as item (item.value)}
              <Select.Item value={item}>{item.label}</Select.Item>
            {/each}
          {:else}
            <Select.Item value="a">a</Select.Item>
            <Select.Item value="b">b</Select.Item>
          {/if}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</Field.Root>
