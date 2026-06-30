<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let {
    items = ['alpha', 'beta', 'gamma'],
    open = false,
    autoHighlight = false,
    keepHighlight = false,
    openOnInputClick = false,
    mode = 'list',
    filter = undefined,
    itemToStringValue = undefined,
    onItemHighlighted = undefined,
    getLabel = undefined
  }: {
    items?: readonly unknown[]
    open?: boolean
    autoHighlight?: boolean | 'always'
    keepHighlight?: boolean
    openOnInputClick?: boolean
    mode?: 'list' | 'both' | 'inline' | 'none'
    filter?:
      | ((item: unknown, query: string, itemToString?: (item: unknown) => string) => boolean)
      | null
    itemToStringValue?: (item: unknown) => string
    onItemHighlighted?: (highlightedValue: unknown, reason: string) => void
    getLabel?: (item: unknown) => string
  } = $props()

  const label = (item: unknown) => (getLabel ? getLabel(item) : String(item))
</script>

<Autocomplete.Root
  {items}
  {open}
  {autoHighlight}
  {keepHighlight}
  {openOnInputClick}
  {mode}
  {filter}
  {itemToStringValue}
  {onItemHighlighted}
>
  <Autocomplete.Input data-testid="input" />
  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.List>
          <Autocomplete.Collection>
            {#snippet children(item)}
              <Autocomplete.Item value={item}>{label(item)}</Autocomplete.Item>
            {/snippet}
          </Autocomplete.Collection>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
