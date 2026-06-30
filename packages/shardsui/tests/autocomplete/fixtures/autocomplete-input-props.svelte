<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let {
    name,
    autocomplete
  }: {
    name?: string
    autocomplete?: HTMLInputElement['autocomplete']
  } = $props()
</script>

<Autocomplete.Root {name}>
  <Autocomplete.Input data-testid="input" {autocomplete} />
  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.List>
          <Autocomplete.Item value="alpha">alpha</Autocomplete.Item>
          <Autocomplete.Item value="beta">beta</Autocomplete.Item>
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
