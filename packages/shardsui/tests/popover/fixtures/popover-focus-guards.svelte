<script lang="ts">
  import { Popover } from '$lib/components/popover'

  let {
    triggerPlacement = 'before-content'
  }: {
    triggerPlacement?: 'before-content' | 'after-content'
  } = $props()
</script>

<div>
  <input data-testid="before" />
  <Popover.Root open>
    {#if triggerPlacement === 'before-content'}
      <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
      <input data-testid="focus-target" />
    {/if}
    <Popover.Portal>
      <Popover.Positioner data-testid="positioner">
        <Popover.Popup data-testid="popover-popup">
          <input data-testid="input-inside" />
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
    {#if triggerPlacement === 'after-content'}
      <Popover.Trigger data-testid="trigger">Toggle</Popover.Trigger>
      <input data-testid="focus-target" />
    {/if}
  </Popover.Root>
  <input data-testid="after" />
</div>
