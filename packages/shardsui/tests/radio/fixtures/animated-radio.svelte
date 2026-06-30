<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let { value = $bindable('a') } = $props()
</script>

<svelte:head>
  <style>
    @keyframes radio-indicator-exit {
      to {
        opacity: 0;
      }
    }
    .radio-indicator-anim[data-ending-style] {
      animation: radio-indicator-exit 1ms;
    }
  </style>
</svelte:head>

<RadioGroup bind:value>
  <Radio.Root value="a" data-testid="radio-a">
    <Radio.Indicator class="radio-indicator-anim" data-testid="indicator-a" />
  </Radio.Root>
  <Radio.Root value="b" data-testid="radio-b">
    <Radio.Indicator class="radio-indicator-anim" data-testid="indicator-b" />
  </Radio.Root>
</RadioGroup>
