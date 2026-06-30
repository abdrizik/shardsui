<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'
</script>

<Autocomplete.Root value={null as never} items={['apple']} open>
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
