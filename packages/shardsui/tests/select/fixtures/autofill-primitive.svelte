<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    name = 'country',
    multiple = false,
    onValueChange = undefined,
    options = [
      { value: 'a', label: 'a' },
      { value: 'b', label: 'b' }
    ]
  }: {
    name?: string
    multiple?: boolean
    onValueChange?: (value: unknown) => void
    options?: { value: string; label: string | null }[]
  } = $props()
</script>

<Select.Root {name} {multiple} {onValueChange}>
  <Select.Trigger data-testid="trigger">
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        {#each options as option (option.value)}
          <Select.Item value={option.value}>{option.label}</Select.Item>
        {/each}
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
