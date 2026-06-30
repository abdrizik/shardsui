<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let { value = $bindable('a'), onanimationend = undefined } = $props()

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
  <button onclick={() => (value = 'b')}>Close</button>
  <RadioGroup {value}>
    <Radio.Root value="a">
      <Radio.Indicator
        class="animation-test-indicator"
        keepMounted
        {onanimationend}
        data-testid="indicator-a"
      />
    </Radio.Root>
    <Radio.Root value="a">
      <Radio.Indicator class="animation-test-indicator" keepMounted />
    </Radio.Root>
  </RadioGroup>
</div>
