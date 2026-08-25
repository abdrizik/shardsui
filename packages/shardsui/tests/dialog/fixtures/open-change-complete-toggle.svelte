<script lang="ts">
  import DialogArrangements from './dialog-arrangements.svelte'

  let {
    arrangement = 'contained',
    open = $bindable(false),
    mode = 'none',
    onOpenChangeComplete
  }: {
    arrangement?: 'contained' | 'detached' | 'multiple-detached'
    open?: boolean
    mode?: 'none' | 'enter' | 'exit'
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()
</script>

<div>
  {#if mode === 'exit'}
    <style>
      @keyframes dialog-test-anim-exit {
        to {
          opacity: 0;
        }
      }
      .animation-test-indicator[data-ending-style] {
        animation: dialog-test-anim-exit 1ms;
      }
    </style>
  {:else if mode === 'enter'}
    <style>
      @keyframes dialog-test-anim-enter {
        from {
          opacity: 0;
        }
      }
      .animation-test-indicator[data-starting-style] {
        animation: dialog-test-anim-enter 1ms;
      }
    </style>
  {/if}
  <button data-testid="toggle" onclick={() => (open = !open)}>Toggle</button>
  <DialogArrangements
    {arrangement}
    bind:open
    popupClass="animation-test-indicator"
    {onOpenChangeComplete}
  />
</div>
