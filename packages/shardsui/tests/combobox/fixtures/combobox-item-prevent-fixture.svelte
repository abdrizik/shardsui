<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    open = true,
    onItemClick = undefined,
    onItemMouseUp = undefined,
    onItemPointerLeave = undefined
  }: {
    open?: boolean
    onItemClick?: (event: MouseEvent) => void
    onItemMouseUp?: (event: MouseEvent) => void
    onItemPointerLeave?: (event: PointerEvent) => void
  } = $props()
</script>

<Combobox.Root items={['one', 'two']} {open}>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Item
            value="one"
            onclick={onItemClick}
            onmouseup={onItemMouseUp}
            onpointerleave={onItemPointerLeave}
          >
            one
          </Combobox.Item>
          <Combobox.Item value="two">two</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
