<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable<string | null>(null),
    complex = false,
    placeholder = undefined as string | undefined
  } = $props()
</script>

<Combobox.Root {value}>
  <Combobox.Value {placeholder}>
    {#if complex}
      <span data-testid="complex">
        <strong>Bold</strong> and <em>italic</em> text
      </span>
    {:else}
      Custom Display Text
    {/if}
  </Combobox.Value>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Item value={value as string}>Test</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
