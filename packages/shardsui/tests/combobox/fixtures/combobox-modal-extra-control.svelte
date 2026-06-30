<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { open = $bindable(true) } = $props()
</script>

<Combobox.Root modal bind:open>
  <Combobox.Trigger>Open</Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.Input />
        <button type="button">Extra control</button>
        <Combobox.List>
          <Combobox.Item value="apple">Apple</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
