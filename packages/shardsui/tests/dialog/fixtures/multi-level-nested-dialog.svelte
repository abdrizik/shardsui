<script lang="ts">
  import { Dialog } from '$lib/components/dialog'
  let { level2Open = true, level3Open = true } = $props()
</script>

<Dialog.Root open={true}>
  <Dialog.Backdrop data-testid="level-1-backdrop" />
  <Dialog.Portal>
    <Dialog.Popup>
      Level 1 dialog
      <Dialog.Root open={level2Open}>
        <Dialog.Backdrop data-testid="level-2-backdrop" />
        <Dialog.Portal>
          <Dialog.Popup>
            Level 2 dialog
            <Dialog.Root open={level3Open}>
              <Dialog.Backdrop data-testid="level-3-backdrop" />
              <Dialog.Portal>
                <Dialog.Popup>Level 3 dialog</Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
