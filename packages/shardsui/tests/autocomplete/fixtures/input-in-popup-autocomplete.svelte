<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let {
    items = ['alpha', 'alpine', 'beta'],
    autoHighlight = false,
    onValueChange = undefined
  }: {
    items?: readonly string[]
    autoHighlight?: boolean | 'always'
    onValueChange?: (value: string) => void
  } = $props()
</script>

<Autocomplete.Root {items} {autoHighlight} {onValueChange}>
  <Autocomplete.Trigger data-testid="trigger">
    <Autocomplete.Value />
  </Autocomplete.Trigger>
  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup aria-label="Commands">
        <Autocomplete.Input data-testid="input" />
        <Autocomplete.List>
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
