<script lang="ts">
  import { Select } from '$lib/components/select'
</script>

<Select.Root open>
  <Select.Trigger data-testid="trigger">Open</Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.List data-testid="list">
          <Select.Item value="one">One</Select.Item>
          <Select.Item value="two">Two</Select.Item>
          <Select.Item value="three">Three</Select.Item>
        </Select.List>
        <Select.ScrollDownArrow
          data-testid="scroll-arrow"
          class="select-scroll-arrow-animation-test"
        />
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>

<style>
  :global {
    @keyframes select-scroll-arrow-close-test {
      to {
        opacity: 0;
      }
    }

    .select-scroll-arrow-animation-test[data-ending-style] {
      animation: select-scroll-arrow-close-test 100ms linear;
    }
  }
</style>
