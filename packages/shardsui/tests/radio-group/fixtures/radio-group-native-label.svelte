<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let {
    explicit = false,
    onValueChange = undefined
  }: {
    explicit?: boolean
    onValueChange?: (value: unknown) => void
  } = $props()
</script>

<RadioGroup {onValueChange}>
  {#if explicit}
    <div>
      <label data-testid="label" for="RadioA">Apple</label>
      <Radio.Root value="apple" id="RadioA" />
    </div>
    <div>
      <label data-testid="label" for="RadioB">Banana</label>
      <Radio.Root value="banana" id="RadioB" />
    </div>
  {:else}
    <label data-testid="label">
      <Radio.Root value="apple" />
      Apple
    </label>
    <label data-testid="label">
      <Radio.Root value="banana" />
      Banana
    </label>
  {/if}
</RadioGroup>
