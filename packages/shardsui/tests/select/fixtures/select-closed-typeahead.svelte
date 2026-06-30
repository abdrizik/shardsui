<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable<string | null>(null),
    onValueChange = undefined,
    options = ['a1', 'a2']
  }: {
    value?: string | null
    onValueChange?: (v: unknown) => void
    options?: string[]
  } = $props()

  function handleChange(v: unknown) {
    value = v as string | null
    onValueChange?.(v)
  }
</script>

<button data-testid="reset" onclick={() => handleChange(null)}>Reset</button>
<button data-testid="set-car" onclick={() => handleChange('car')}>Set car</button>
<Select.Root {value} onValueChange={handleChange}>
  <Select.Trigger data-testid="trigger">
    <Select.Value data-testid="value" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        {#each options as option (option)}
          <Select.Item value={option}>{option}</Select.Item>
        {/each}
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
