<script lang="ts">
  import { Select } from '$lib/components/select'

  let { onOpenChangeComplete = undefined }: { onOpenChangeComplete?: (open: boolean) => void } =
    $props()

  const items = Array.from({ length: 80 }, (_, index) => `Item ${index + 1}`)

  let paddingTop = $state(0)
  let trigger = $state<HTMLElement | null>(null)

  $effect(() => {
    const current = paddingTop
    if (!trigger) return
    const gap = document.documentElement.clientHeight - trigger.getBoundingClientRect().bottom
    if (Math.abs(gap - 100) <= 1) return
    paddingTop = current + gap - 100
  })
</script>

<div style="padding-top: {paddingTop}px">
  <button data-testid="outside">Outside</button>
  <Select.Root {onOpenChangeComplete}>
    <Select.Trigger bind:ref={trigger}>Open</Select.Trigger>
    <Select.Portal>
      <Select.Positioner data-testid="positioner" sideOffset={8}>
        <Select.Popup class="select-reopen-popup">
          <Select.ScrollUpArrow />
          <Select.Arrow />
          <Select.List class="select-reopen-list">
            <div aria-hidden="true" style="height: 75px">Start</div>
            {#each items as item (item)}
              <Select.Item value={item}>{item}</Select.Item>
            {/each}
            <div aria-hidden="true" style="height: 75px">End</div>
          </Select.List>
          <Select.ScrollDownArrow />
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
</div>

<style>
  :global {
    @keyframes select-reopen-exit {
      to {
        opacity: 0;
        transform: scale(0.9);
      }
    }

    .select-reopen-popup {
      width: 120px;
      transition:
        transform 150ms,
        opacity 150ms;
    }

    .select-reopen-popup[data-starting-style],
    .select-reopen-popup[data-ending-style] {
      animation: select-reopen-exit 20ms linear;
    }

    .select-reopen-list {
      max-height: var(--available-height);
      overflow-y: auto;
    }
  }
</style>
