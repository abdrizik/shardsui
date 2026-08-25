<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'

  let {
    open = $bindable(),
    onItemHighlighted,
    rows = [
      ['1', '2', '3'],
      ['4', '5', '6']
    ]
  }: {
    open?: boolean
    onItemHighlighted?: ComponentProps<typeof Combobox.Root>['onItemHighlighted']
    rows?: string[][]
  } = $props()
</script>

<Combobox.Root grid {open} {onItemHighlighted}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          {#each rows as row, r (r)}
            <Combobox.Row>
              {#each row as cell (cell)}
                <Combobox.Item value={cell}>{cell}</Combobox.Item>
              {/each}
            </Combobox.Row>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
