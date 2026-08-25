<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import type { Side } from '$lib/internal/floating/anchor-positioning.svelte'

  let {
    value = $bindable(),
    onValueChange,
    open = $bindable(),
    onOpenChange,
    disabled = false,
    triggerDisabled = false,
    readOnly = false,
    required = false,
    multiple = false,
    inputInsidePopup = false,
    items,
    side,
    triggerAs = 'button'
  }: {
    value?: unknown
    onValueChange?: (value: unknown) => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
    disabled?: boolean
    triggerDisabled?: boolean
    readOnly?: boolean
    required?: boolean
    multiple?: boolean
    inputInsidePopup?: boolean
    items?: readonly string[]
    side?: Side
    triggerAs?: 'button' | 'div'
  } = $props()

  const fallbackItems = ['apple', 'banana', 'cherry'] as const
  const labels = { apple: 'Apple', banana: 'Banana', cherry: 'Cherry' }
</script>

<Combobox.Root
  {items}
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
