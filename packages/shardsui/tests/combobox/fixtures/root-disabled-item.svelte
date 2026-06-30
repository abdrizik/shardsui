<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let { onitemclick = undefined as ((event: MouseEvent) => void) | undefined } = $props()
</script>

<Combobox.Root open disabled>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Item value="one" onclick={onitemclick}>one</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
