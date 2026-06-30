<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable(['a'] as unknown[]),
    disabled = true,
    name = 'x'
  }: {
    value?: unknown[]
    disabled?: boolean
    name?: string
  } = $props()
</script>

<form data-testid="form">
  <Combobox.Root multiple {disabled} {name} bind:value>
    <Combobox.Input data-testid="input" />
  </Combobox.Root>
</form>
