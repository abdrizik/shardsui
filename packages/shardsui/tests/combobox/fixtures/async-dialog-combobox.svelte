<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { Dialog } from '$lib/components/dialog'
  import ItemsList from './items-list.svelte'

  let loading = $state(true)
  let value = $state<string | null>(null)

  $effect(() => {
    const timeout = setTimeout(() => (loading = false), 0)
    return () => clearTimeout(timeout)
  })
</script>

<Dialog.Root open>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <form>
        <label for="name">Name</label>
        <input id="name" disabled={loading} />

        <label for="fruit">Fruit</label>
        <Combobox.Root
          items={['Apple', 'Banana', 'Cherry']}
          {value}
          onValueChange={(next: unknown) => (value = next as string | null)}
          disabled={loading}
        >
          <Combobox.Input id="fruit" placeholder="Select fruit..." />
          <Combobox.Trigger aria-label="Open" />
          <Combobox.Portal>
            <Combobox.Positioner>
              <Combobox.Popup data-testid="popup">
                <ItemsList />
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>

        <button type="button">Cancel</button>
        <button type="submit" disabled={loading}>Save</button>
      </form>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
