<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
  import { Combobox } from '$lib/components/combobox'

  let { onOpenChange = undefined }: { onOpenChange?: (open: boolean) => void } = $props()

  const items = [
    'Apple',
    'Banana',
    'Cherry',
    'Date',
    'Elderberry',
    'Fig',
    'Grape',
    'Honeydew',
    'Kiwi',
    'Lime'
  ]
</script>

<Drawer.Root open {onOpenChange}>
  <Drawer.Portal>
    <Drawer.Backdrop data-testid="backdrop" />
    <Drawer.Viewport>
      <Drawer.Popup>
        <Drawer.Content>
          <Combobox.Root open>
            <Combobox.Input />
            <Combobox.Portal>
              <Combobox.Positioner>
                <Combobox.Popup>
                  <Combobox.List style="max-height: 40px; overflow: auto;">
                    {#each items as item (item)}
                      <Combobox.Item value={item}>{item}</Combobox.Item>
                    {/each}
                  </Combobox.List>
                </Combobox.Popup>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
