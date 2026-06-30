<script lang="ts">
  import { Autocomplete } from '$lib/components/autocomplete'

  let { value = $bindable('apple') } = $props()
</script>

<Autocomplete.Root bind:value>
  <Autocomplete.Input data-testid="input" />
  <Autocomplete.Clear data-testid="clear" />
</Autocomplete.Root>
