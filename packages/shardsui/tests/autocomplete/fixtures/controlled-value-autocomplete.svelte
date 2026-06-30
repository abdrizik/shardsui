<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let value = $state('')
</script>

<button type="button" data-testid="update" onclick={() => (value = 'ba')}>update value</button>
<Autocomplete.Root bind:value items={['apple', 'banana']} mode="both">
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
