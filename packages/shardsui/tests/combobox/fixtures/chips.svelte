<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { DirectionProvider } from '$lib/components/direction-provider'
  import { Field } from '$lib/components/field'

  let {
    value = $bindable(),
    onValueChange,
    open = $bindable(),
    onOpenChange,
    disabled = false,
    readOnly = false,
    direction = 'ltr',
    chips = ['apple', 'banana'],
    onChipsMouseDown,
    withRemove = false,
    withPopup = true,
    inputFirst = false,
    withField = false
  }: {
    value?: string[] | null
    onValueChange?: (value: unknown) => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
    disabled?: boolean
    readOnly?: boolean
    direction?: 'ltr' | 'rtl'
    chips?: string[]
    onChipsMouseDown?: (event: MouseEvent & { preventShardsUIHandler(): void }) => void
    withRemove?: boolean
    withPopup?: boolean
    inputFirst?: boolean
    withField?: boolean
  } = $props()
</script>

{#snippet combobox()}
  <Combobox.Root
    multiple
    items={['apple', 'banana', 'cherry']}
    {value}
    {onValueChange}
    {open}
    {onOpenChange}
    {disabled}
    {readOnly}
  >
    <Combobox.Chips
      data-testid="chips"
      onmousedown={onChipsMouseDown as ((event: MouseEvent) => void) | undefined}
    >
      {#if inputFirst}
        <Combobox.Input data-testid="input" />
      {/if}
      {#each chips as chip (chip)}
        <Combobox.Chip data-testid="chip-{chip}">
          {chip}
          {#if withRemove}
            <Combobox.ChipRemove data-testid="remove-{chip}" />
          {/if}
        </Combobox.Chip>
      {/each}
      {#if !inputFirst}
        <Combobox.Input data-testid="input" />
      {/if}
    </Combobox.Chips>
    {#if withPopup}
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
    {/if}
  </Combobox.Root>
{/snippet}

<DirectionProvider {direction}>
  {#if withField}
    <Field.Root disabled>
      {@render combobox()}
    </Field.Root>
  {:else}
    {@render combobox()}
  {/if}
</DirectionProvider>
