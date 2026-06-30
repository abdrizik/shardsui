<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { showTrigger = true, onOpenChange = undefined } = $props()
</script>

<Combobox.Root {onOpenChange}>
  {#if showTrigger}
    <Combobox.Trigger data-testid="trigger">Open</Combobox.Trigger>
  {/if}
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Item value="alpha">Alpha</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
