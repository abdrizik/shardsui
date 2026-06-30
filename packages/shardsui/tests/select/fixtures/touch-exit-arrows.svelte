<script lang="ts">
  import { Select } from '$lib/components/select'

  const labels = Array.from({ length: 20 }, (_, i) => `Item ${i}`)
</script>

<Select.Root>
  <Select.Trigger data-testid="trigger">Open</Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup class="select-popup-exit-test">
        <Select.ScrollUpArrow keepMounted data-testid="up-arrow" />
        <Select.List data-testid="list" style="max-height: 40px; overflow: auto">
          {#each labels as label, i (i)}
            <Select.Item value={label} style="height: 20px">{label}</Select.Item>
          {/each}
        </Select.List>
        <Select.ScrollDownArrow keepMounted data-testid="down-arrow" />
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>

<style>
  :global {
    @keyframes select-popup-close-test {
      to {
        opacity: 0;
      }
    }

    .select-popup-exit-test[data-ending-style] {
      animation: select-popup-close-test 200ms linear;
    }
  }
</style>
