<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    value = $bindable<unknown>(undefined),
    items = undefined,
    placeholder = undefined,
    mode = 'string'
  }: {
    value?: unknown
    items?: readonly { label: unknown; value: unknown }[] | Record<string, unknown> | undefined
    placeholder?: string
    mode?: 'string' | 'function'
  } = $props()
</script>

<Select.Root {value} {items}>
  <Select.Trigger>
    <Select.Value data-testid="value" {placeholder}>
      {#snippet children(v)}
        {#if mode === 'function'}{v ?? 'Function fallback'}{:else}Custom Text{/if}
      {/snippet}
    </Select.Value>
  </Select.Trigger>
</Select.Root>
