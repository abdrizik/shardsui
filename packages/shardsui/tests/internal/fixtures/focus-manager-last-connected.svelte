<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let parentOpen = $state(false)
  let childOpen = $state(false)
</script>

<div>
  <Dialog.Root bind:open={parentOpen}>
    <Dialog.Trigger data-testid="parent-reference">parent</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Popup data-testid="parent-floating">
        <button
          data-testid="parent-floating-reference"
          onclick={() => {
            childOpen = true
            parentOpen = false
          }}>open child</button
        >
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>

  <Dialog.Root bind:open={childOpen}>
    <Dialog.Portal>
      <Dialog.Popup data-testid="child-floating">
        <button data-testid="child-reference">child</button>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
</div>
