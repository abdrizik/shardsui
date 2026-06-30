<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let { value = $bindable('b'), ontransitionend = undefined } = $props()

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
  <button onclick={() => (value = 'a')}>Select a</button>
  <RadioGroup {value}>
    <Radio.Root value="a">
      <Radio.Indicator
        class="animation-test-indicator"
        data-testid="indicator-a"
        {ontransitionend}
      />
    </Radio.Root>
    <Radio.Root value="b">
      <Radio.Indicator class="animation-test-indicator" data-testid="indicator-b" />
    </Radio.Root>
  </RadioGroup>
</div>
