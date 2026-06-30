<script lang="ts">
  import { AlertDialog } from '$lib/components/alert-dialog'

  let {
    open = $bindable(false),
    mode = 'exit',
    onOpenChangeComplete = undefined
  }: {
    open?: boolean
    mode?: 'exit' | 'enter'
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()
</script>

<div>
  {#if mode === 'exit'}
    <style>
      @keyframes test-anim-exit {
        to {
          opacity: 0;
        }
      }
      .animation-test-indicator[data-ending-style] {
        animation: test-anim-exit 1ms;
      }
    </style>
  {:else}
    <style>
      @keyframes test-anim-enter {
        from {
          opacity: 0;
        }
      }
      .animation-test-indicator[data-starting-style] {
        animation: test-anim-enter 1ms;
      }
    </style>
  {/if}
  <button data-testid="toggle" onclick={() => (open = !open)}>Toggle</button>
  <AlertDialog.Root bind:open {onOpenChangeComplete}>
    <AlertDialog.Portal>
      <AlertDialog.Popup class="animation-test-indicator" data-testid="popup" />
    </AlertDialog.Portal>
  </AlertDialog.Root>
</div>
