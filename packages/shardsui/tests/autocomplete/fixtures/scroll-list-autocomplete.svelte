<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let {
    items,
    mode = 'list',
    openOnInputClick = false
  }: {
    items: readonly string[]
    mode?: 'list' | 'both' | 'inline' | 'none'
    openOnInputClick?: boolean
  } = $props()
</script>

<Autocomplete.Root {items} {mode} {openOnInputClick}>
  <Autocomplete.Input data-testid="input" />
  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.List style="max-height: 100px; overflow-y: auto;">
          <Autocomplete.Collection>
            {#snippet children(item)}
              <Autocomplete.Item value={item}>{item}</Autocomplete.Item>
            {/snippet}
          </Autocomplete.Collection>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
