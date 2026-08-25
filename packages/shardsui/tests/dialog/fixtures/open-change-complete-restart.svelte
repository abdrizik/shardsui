<script lang="ts">
  import DialogArrangements from './dialog-arrangements.svelte'

  let {
    arrangement = 'contained',
    onOpenChangeComplete
  }: {
    arrangement?: 'contained' | 'detached' | 'multiple-detached'
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()

  let open = $state(false)
  let variant = $state<'a' | 'b'>('a')
</script>

<div>
  <style>
    @keyframes dialog-test-enter-a {
      from {
        opacity: 0;
      }
    }
    @keyframes dialog-test-enter-b {
      from {
        opacity: 0;
      }
    }
    .animation-test-indicator.animation-a[data-open] {
      animation: dialog-test-enter-a 50ms linear;
    }
    .animation-test-indicator.animation-b[data-open] {
      animation: dialog-test-enter-b 50ms linear;
    }
  </style>
  <button onclick={() => (open = true)}>Open externally</button>
  <button onclick={() => (variant = variant === 'a' ? 'b' : 'a')}>Swap animation</button>
  <DialogArrangements
    {arrangement}
    bind:open
    popupClass={`animation-test-indicator animation-${variant}`}
    {onOpenChangeComplete}
  />
</div>
