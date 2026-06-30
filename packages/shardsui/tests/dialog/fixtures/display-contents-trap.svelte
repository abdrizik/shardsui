<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
</script>

<div>
  <button data-testid="outside-before">Outside before</button>
  <Dialog.Root open modal="trap-focus">
    <Dialog.Portal>
      <form style="display: contents;">
        <Dialog.Popup data-testid="dialog-popup">
          <input data-testid="first-input" />
          <button type="button" data-testid="second-button">Second</button>
        </Dialog.Popup>
      </form>
    </Dialog.Portal>
  </Dialog.Root>
  <button data-testid="outside-after">Outside after</button>
</div>
