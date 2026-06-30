<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
</script>

<Combobox.Root open value="apple">
  <Combobox.Input data-testid="input" />
  <Combobox.Portal keepMounted>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List>
          <Combobox.Item value="apple">
            apple
            <Combobox.ItemIndicator keepMounted data-testid="apple-indicator" />
          </Combobox.Item>
          <Combobox.Item value="banana">banana</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
