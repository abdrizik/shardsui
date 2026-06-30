<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'

  let {
    ontransitionend = undefined
  }: {
    ontransitionend?: (event: TransitionEvent) => void
  } = $props()

  let checked = $state(false)

  const style = `
    .animation-test-indicator {
      transition: opacity 1ms;
    }

    .animation-test-indicator[data-starting-style],
    .animation-test-indicator[data-ending-style] {
      opacity: 0;
    }
  `
</script>

<svelte:head>
  {@html `<style>${style}</style>`}
</svelte:head>

<div>
  <button onclick={() => (checked = true)}>Check</button>
  <Checkbox.Root {checked}>
    <Checkbox.Indicator
      class="animation-test-indicator"
      data-testid="indicator"
      {ontransitionend}
    />
  </Checkbox.Root>
</div>
