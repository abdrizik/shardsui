<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { value = $bindable(), open = $bindable(), withValue = false } = $props()
</script>

<Combobox.Root {value} {open}>
  <Combobox.Trigger data-testid="trigger">
    {#if withValue}
      <Combobox.Value placeholder="None" />
    {:else}
      Open
    {/if}
  </Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner data-testid="positioner">
      <Combobox.Popup data-testid="popup">
        <Combobox.Input data-testid="input" />
        <Combobox.Clear keepMounted data-testid="clear">
          {#snippet children({ visible })}
            <span data-testid="clear-state">{visible ? 'visible' : 'hidden'}</span>
          {/snippet}
        </Combobox.Clear>
        <Combobox.List data-testid="list">
          <Combobox.Item value="a">a</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
