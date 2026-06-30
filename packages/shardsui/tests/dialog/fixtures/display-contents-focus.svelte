<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
</script>

<div>
  <button data-testid="outside-before">Outside before</button>
  <Dialog.Root modal={false}>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <form style="display: contents;">
        <Dialog.Popup data-testid="dialog-popup">
          <input data-testid="dialog-input" />
          <button type="button">Close</button>
        </Dialog.Popup>
      </form>
    </Dialog.Portal>
  </Dialog.Root>
  <button data-testid="outside-after">Outside after</button>
</div>
