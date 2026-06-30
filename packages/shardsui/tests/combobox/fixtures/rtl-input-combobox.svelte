<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { DirectionProvider } from '$lib/components/direction-provider'
</script>

<DirectionProvider direction="rtl">
  <Combobox.Root inputValue="apple">
    <Combobox.Input data-testid="input" />
  </Combobox.Root>
</DirectionProvider>
