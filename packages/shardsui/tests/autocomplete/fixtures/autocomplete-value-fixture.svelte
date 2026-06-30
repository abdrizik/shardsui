<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let {
    value = $bindable(''),
    variant = 'function' as 'function' | 'static' | 'complex'
  }: {
    value?: string
    variant?: 'function' | 'static' | 'complex'
  } = $props()
</script>

<Autocomplete.Root bind:value>
  <Autocomplete.Value>
    {#snippet children(val)}
      {#if variant === 'function'}
        <div data-testid="value">{val === '' ? 'empty' : val}</div>
      {:else if variant === 'static'}
        <span>Custom Display Text</span>
      {:else}
        <span data-testid="complex"><strong>Bold</strong> and <em>italic</em> text</span>
      {/if}
    {/snippet}
  </Autocomplete.Value>
  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.List>
          <Autocomplete.Item value="hello">hello</Autocomplete.Item>
          <Autocomplete.Item value="help">help</Autocomplete.Item>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
