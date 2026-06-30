<script lang="ts">
  import { Popover } from '$lib/components/popover'
  import { Combobox } from '$lib/components/combobox'

  let { withFocusTarget = false }: { withFocusTarget?: boolean } = $props()
</script>

<div>
  <Popover.Root open>
    <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
    {#if withFocusTarget}
      <input data-testid="focus-target" />
    {/if}
    <Popover.Portal keepMounted>
      <Popover.Positioner>
        <Popover.Popup data-testid="popover-popup">
          <Combobox.Root>
            <Combobox.Input data-testid="combobox-input" />
            <Combobox.Portal>
              <Combobox.Positioner>
                <Combobox.Popup>
                  <Combobox.List>
                    <Combobox.Item value="a">a</Combobox.Item>
                    <Combobox.Item value="b">b</Combobox.Item>
                  </Combobox.List>
                </Combobox.Popup>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
</div>
