<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let {
    items = ['alpha'],
    onFormSubmit = undefined
  }: {
    items?: readonly string[]
    onFormSubmit?: (data: FormData) => void
  } = $props()
</script>

<form
  onsubmit={(e) => {
    e.preventDefault()
    onFormSubmit?.(new FormData(e.currentTarget))
  }}
>
  <Autocomplete.Root {items} submitOnItemClick>
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
</form>
