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
</script>

<div>
  <style>
    .animation-test-indicator {
      opacity: 0;
      transition: opacity 200ms linear;
    }
    .animation-test-indicator[data-open] {
      opacity: 1;
    }
    .animation-test-indicator[data-open][data-starting-style] {
      opacity: 0;
    }
    .animation-test-indicator[data-ending-style] {
      opacity: 0;
    }
  </style>
  <button onclick={() => (open = true)}>Open externally</button>
  <DialogArrangements
    {arrangement}
    bind:open
    modal={false}
    popupClass="animation-test-indicator"
    {onOpenChangeComplete}
  />
</div>
