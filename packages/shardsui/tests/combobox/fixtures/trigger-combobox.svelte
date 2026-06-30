<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import type { Side } from '$lib/internal/floating/anchor-positioning.svelte'

  let {
    value = $bindable(),
    onValueChange = undefined,
    open = $bindable(),
    onOpenChange = undefined,
    disabled = false,
    triggerDisabled = false,
    readOnly = false,
    required = false,
    multiple = false,
    inputInsidePopup = false,
    items = undefined as readonly unknown[] | undefined,
    side = undefined as Side | undefined,
    triggerAs = 'button' as 'button' | 'div'
  } = $props()

  const fallbackItems = ['apple', 'banana', 'cherry']
  const labels: Record<string, string> = { apple: 'Apple', banana: 'Banana', cherry: 'Cherry' }
</script>

<Combobox.Root
  items={items as never}
  {value}
  {onValueChange}
  {open}
  {onOpenChange}
  {disabled}
  {readOnly}
  {required}
  {multiple}
>
  {#if !inputInsidePopup}
    <Combobox.Input data-testid="input" />
  {/if}
  <Combobox.Trigger as={triggerAs} data-testid="trigger" disabled={triggerDisabled}>
    Open
  </Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner {side}>
      <Combobox.Popup data-testid="popup">
        {#if inputInsidePopup}
          <Combobox.Input data-testid="input" />
        {/if}
        <Combobox.List data-testid="list">
          {#if items}
            {#each items as item (String(item))}
              <Combobox.Item value={item}>{String(item)}</Combobox.Item>
            {/each}
          {:else}
            {#each fallbackItems as item (item)}
              <Combobox.Item value={item}>{labels[item]}</Combobox.Item>
            {/each}
          {/if}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
