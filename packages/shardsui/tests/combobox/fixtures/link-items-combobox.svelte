<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { open = $bindable(true), onValueChange = undefined } = $props()
</script>

<Combobox.Root bind:open {onValueChange}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List>
          <Combobox.Item value="hash" data-testid="item-hash">
            <a href="#section" data-testid="link-hash">Hash link</a>
          </Combobox.Item>
          <Combobox.Item value="href" data-testid="item-href">
            <a href="/somewhere" data-testid="link-href">External</a>
          </Combobox.Item>
          <Combobox.Item value="nohref" data-testid="item-nohref">
            <!-- svelte-ignore a11y_missing_attribute -->
            <a data-testid="link-nohref">No href</a>
          </Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
