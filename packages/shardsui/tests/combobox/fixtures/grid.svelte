<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { DirectionProvider } from '$lib/components/direction-provider'

  let {
    open = $bindable(true),
    onItemHighlighted = undefined,
    autoHighlight = false,
    direction = 'ltr' as 'ltr' | 'rtl',
    rows = [
      ['1', '2', '3'],
      ['4', '5', '6']
    ] as string[][],
    grouped = false
  } = $props()
</script>

<DirectionProvider {direction}>
  <Combobox.Root grid {open} {autoHighlight} {onItemHighlighted}>
    <Combobox.Input data-testid="input" />
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          <Combobox.List data-testid="list">
            {#each rows as row, r (r)}
              {#if grouped}
                <Combobox.Group>
                  <Combobox.Row>
                    {#each row as cell (cell)}
                      <Combobox.Item value={cell}>{cell}</Combobox.Item>
                    {/each}
                  </Combobox.Row>
                </Combobox.Group>
              {:else}
                <Combobox.Row>
                  {#each row as cell (cell)}
                    <Combobox.Item value={cell}>{cell}</Combobox.Item>
                  {/each}
                </Combobox.Row>
              {/if}
            {/each}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
</DirectionProvider>
