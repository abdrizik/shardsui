<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
</script>

<Dialog.Root>
  <Dialog.Trigger>Trigger 0</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup data-testid="popup0">
      <Dialog.Root>
        <Dialog.Trigger>Trigger 1</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Popup data-testid="popup1">
            <Dialog.Root>
              <Dialog.Trigger>Trigger 2</Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Popup data-testid="popup2">
                  <Dialog.Close>Close 2</Dialog.Close>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
            <Dialog.Close>Close 1</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
