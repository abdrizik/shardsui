<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  type FilterFn =
    | ((item: string, query: string, itemToString?: (item: string) => string) => boolean)
    | null

  let {
    items = undefined,
    mode = 'list',
    filter = undefined,
    locale = undefined,
    openOnInputClick = true
  }: {
    items?: readonly string[]
    mode?: 'list' | 'both' | 'inline' | 'none'
    filter?: FilterFn
    locale?: Intl.LocalesArgument
    openOnInputClick?: boolean
  } = $props()
</script>

<Autocomplete.Root {items} {mode} {filter} {locale} {openOnInputClick}>
  <Autocomplete.Input data-testid="input" />
  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
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
