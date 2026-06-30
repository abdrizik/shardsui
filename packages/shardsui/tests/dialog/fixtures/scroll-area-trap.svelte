<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  import { ScrollArea } from '$lib/components/scroll-area'
</script>

<div>
  <button data-testid="outside-before">Outside before</button>
  <Dialog.Root open modal="trap-focus">
    <Dialog.Portal>
      <Dialog.Popup data-testid="dialog-popup">
        <ScrollArea.Root style="width: 200px; height: 200px;">
          <ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%;">
            <div style="width: 100px; height: 100px;">Non-scrollable content</div>
          </ScrollArea.Viewport>
        </ScrollArea.Root>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
  <button data-testid="outside-after">Outside after</button>
</div>
