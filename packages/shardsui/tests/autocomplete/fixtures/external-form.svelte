<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let {
    name = 'q',
    items = ['alpha', 'alpine'],
    submitOnItemClick = false,
    withSubmitButton = false,
    onFormSubmit = undefined
  }: {
    name?: string
    items?: readonly string[]
    submitOnItemClick?: boolean
    withSubmitButton?: boolean
    onFormSubmit?: (data: FormData) => void
  } = $props()
</script>

<form
  id="external-form"
  onsubmit={(e) => {
    e.preventDefault()
    onFormSubmit?.(new FormData(e.currentTarget))
  }}
>
  {#if withSubmitButton}
    <button type="submit" data-testid="external-submit">Submit</button>
  {/if}
</form>
<Autocomplete.Root {items} {name} form="external-form" {submitOnItemClick}>
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
