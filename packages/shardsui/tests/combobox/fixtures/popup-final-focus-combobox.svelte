<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { open = $bindable(true) } = $props()

  let finalFocus = $state<HTMLButtonElement | null>(null)
</script>

<button bind:this={finalFocus} type="button">final focus</button>
<Combobox.Root bind:open>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup {finalFocus}>
        <Combobox.List>
          <Combobox.Item value="a">a</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
