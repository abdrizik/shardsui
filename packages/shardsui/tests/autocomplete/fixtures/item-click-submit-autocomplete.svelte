<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let { withForm = false }: { withForm?: boolean } = $props()
</script>

{#snippet autocomplete()}
  <Autocomplete.Root open submitOnItemClick>
    <Autocomplete.Input data-testid="input" />
    <Autocomplete.Portal>
      <Autocomplete.Positioner>
        <Autocomplete.Popup>
          <Autocomplete.List>
            <Autocomplete.Item value="apple">apple</Autocomplete.Item>
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete.Portal>
  </Autocomplete.Root>
{/snippet}

{#if withForm}
  <form aria-label="search">
    {@render autocomplete()}
  </form>
{:else}
  {@render autocomplete()}
{/if}
