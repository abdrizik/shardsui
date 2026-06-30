<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable<unknown>(undefined),
    items = undefined
  }: {
    value?: unknown
    items?: readonly unknown[] | Record<string, unknown> | undefined
  } = $props()
</script>

<Select.Root multiple value={value as never} items={items as never}>
  <Select.Value data-testid="value">
    {#snippet children(v)}
      Array: {Array.isArray(v)} | Joined: {Array.isArray(v) ? v.join(' + ') : String(v)}
    {/snippet}
  </Select.Value>
</Select.Root>
