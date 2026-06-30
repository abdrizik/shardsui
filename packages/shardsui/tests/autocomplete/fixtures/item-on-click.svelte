<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let {
    items = ['one', 'two'],
    onItemClick = undefined
  }: {
    items?: readonly string[]
    onItemClick?: (event: MouseEvent) => void
  } = $props()
</script>

<Autocomplete.Root {items} openOnInputClick>
  <Autocomplete.Input data-testid="input" />
  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.List>
          <Autocomplete.Collection>
            {#snippet children(item)}
              <Autocomplete.Item value={item} onclick={onItemClick}>{item}</Autocomplete.Item>
            {/snippet}
          </Autocomplete.Collection>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
