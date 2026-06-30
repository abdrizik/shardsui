<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Popover } from '$lib/components/popover'

  const items = Array.from({ length: 50 }, (_, index) => String(index))
</script>

<Popover.Root open>
  <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner>
      <Popover.Popup data-testid="popover-popup">
        <Combobox.Root open>
          <Combobox.Input placeholder="Choose a fruit" />
          <Combobox.Portal>
            <Combobox.Positioner>
              <Combobox.Popup
                data-testid="combobox-popup"
                style="max-height: 200px; overflow: auto;"
              >
                <Combobox.List>
                  {#each items as item (item)}
                    <Combobox.Item value={item} style="height: 100px;">{item}</Combobox.Item>
                  {/each}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
