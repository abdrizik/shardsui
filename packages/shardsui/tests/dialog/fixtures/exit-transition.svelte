<script lang="ts">
  import { Dialog } from '$lib/components/dialog'

  let {
    open = false,
    ontransitionend = undefined
  }: { open?: boolean; ontransitionend?: (event: TransitionEvent) => void } = $props()
</script>

<div>
  <style>
    .transition-test-dialog {
      opacity: 0;
      transition: opacity 200ms;
    }
    .transition-test-dialog[data-open] {
      opacity: 1;
    }
  </style>
  <Dialog.Root {open} modal={false}>
    <Dialog.Portal keepMounted>
      <Dialog.Popup class="transition-test-dialog" data-testid="dialog-popup" {ontransitionend} />
    </Dialog.Portal>
  </Dialog.Root>
</div>
