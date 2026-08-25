<script lang="ts">
  import { untrack } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import { Dialog } from '$lib/components/dialog'
  import ItemsList from './items-list.svelte'

  let {
    multiple = false,
    initialOpen = true,
    fruits = ['Apple', 'Apricot', 'Banana', 'Grape', 'Orange']
  }: {
    multiple?: boolean
    initialOpen?: boolean
    fruits?: string[]
  } = $props()

  let open = $state(untrack(() => initialOpen))
</script>

<Combobox.Root
  items={fruits}
  {multiple}
  inline
  open={multiple ? undefined : open}
  onOpenChange={multiple ? undefined : (next: boolean) => (open = next)}
>
  <Dialog.Root {open} onOpenChange={(next: boolean) => (open = next)}>
    <Dialog.Trigger data-testid="dialog-trigger">
      <Combobox.Value>
        {#snippet children(value)}
          {value == null ? 'Select a fruit' : String(value)}
        {/snippet}
      </Combobox.Value>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Popup aria-label="Fruit chooser">
        <div>
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label>Fruit</label>
          <Combobox.Input data-testid="dialog-input" placeholder="e.g. Apple" />
        </div>
        <ItemsList />
        <Dialog.Close>Done</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
</Combobox.Root>
