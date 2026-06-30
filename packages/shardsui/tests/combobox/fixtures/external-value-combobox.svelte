<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable('banana' as unknown),
    onItemHighlighted = undefined,
    multiple = false,
    nextValue = null as unknown
  }: {
    value?: unknown
    onItemHighlighted?: (value: unknown) => void
    multiple?: boolean
    nextValue?: unknown
  } = $props()
</script>

<div>
  <Combobox.Root bind:value {multiple} {onItemHighlighted}>
    <Combobox.Input data-testid="input" />
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Popup data-testid="popup">
          <Combobox.List>
            <Combobox.Item value="apple">apple</Combobox.Item>
            <Combobox.Item value="banana">banana</Combobox.Item>
            <Combobox.Item value="cherry">cherry</Combobox.Item>
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
  <button
    type="button"
    data-testid="external-set"
    onclick={() => {
      value = nextValue
    }}
  >
    Set
  </button>
</div>
