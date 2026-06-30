<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
</script>

<Combobox.Root open>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Group data-testid="group">
            <Combobox.Collection>
              {#snippet children(item: string)}
                <span>{item}</span>
              {/snippet}
            </Combobox.Collection>
          </Combobox.Group>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
