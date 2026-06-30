<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'

  let {
    keepMounted = false,
    onanimationend = undefined
  }: {
    keepMounted?: boolean
    onanimationend?: (event: AnimationEvent) => void
  } = $props()

  let checked = $state(true)

  const style = `
    @keyframes test-anim {
      to {
        opacity: 0;
      }
    }

    .animation-test-indicator[data-ending-style] {
      animation: test-anim 1ms;
    }
  `
</script>

<svelte:head>
  {@html `<style>${style}</style>`}
</svelte:head>

<div>
  <button onclick={() => (checked = false)}>Uncheck</button>
  <Checkbox.Root {checked}>
    <Checkbox.Indicator
      class="animation-test-indicator"
      data-testid="indicator"
      {keepMounted}
      {onanimationend}
    />
  </Checkbox.Root>
</div>
