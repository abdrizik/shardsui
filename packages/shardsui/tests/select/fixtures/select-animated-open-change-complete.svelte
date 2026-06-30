<script lang="ts">
  import { Select } from '$lib/components/select'

  let {
    open = $bindable(false),
    onOpenChangeComplete = undefined
  }: {
    open?: boolean
    onOpenChangeComplete?: (open: boolean) => void
  } = $props()
</script>

<button type="button" data-testid="open-external" onclick={() => (open = true)}>Open</button>
<button type="button" data-testid="close-external" onclick={() => (open = false)}>Close</button>

<Select.Root bind:open {onOpenChangeComplete}>
  <Select.Trigger data-testid="trigger">
    <Select.Value placeholder="Pick one" />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup data-testid="popup" class="select-animation-test-indicator">
        <Select.Item value="a">Option A</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>

<style>
  :global {
    @keyframes select-complete-enter {
      from {
        opacity: 0;
      }
    }

    @keyframes select-complete-exit {
      to {
        opacity: 0;
      }
    }

    .select-animation-test-indicator[data-starting-style] {
      animation: select-complete-enter 1ms;
    }

    .select-animation-test-indicator[data-ending-style] {
      animation: select-complete-exit 1ms;
    }
  }
</style>
