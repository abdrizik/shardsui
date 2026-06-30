<script module lang="ts">
  const ITEMS = Array.from({ length: 40 }, (_, index) => `item-${index}`)
</script>

<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
</script>

<!-- Anchor fixed near the bottom of the viewport: less room below than above,
     but still more than the List's capped height. -->
<div style="position: fixed; bottom: 120px; left: 100px;">
  <Combobox.Root open>
    <Combobox.Input data-testid="input" />
    <Combobox.Portal>
      <Combobox.Positioner data-testid="positioner" side="bottom" sideOffset={0}>
        <Combobox.Popup data-testid="popup">
          <Combobox.List
            data-testid="list"
            style="max-height: min(80px, var(--available-height)); overflow-y: auto;"
          >
            {#each ITEMS as item (item)}
              <Combobox.Item value={item} style="height: 30px;">{item}</Combobox.Item>
            {/each}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
</div>
