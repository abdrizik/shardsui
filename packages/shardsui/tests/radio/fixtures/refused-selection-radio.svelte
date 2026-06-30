<script lang="ts">
  import { Radio } from '$lib/components/radio'
  import { RadioGroup } from '$lib/components/radio-group'

  let { readOnly = false, cancel = false }: { readOnly?: boolean; cancel?: boolean } = $props()

  let value = $state<unknown>('a')
</script>

<RadioGroup
  bind:value={
    () => value,
    (next) => {
      if (!cancel) value = next
    }
  }
  {readOnly}
  name="plan"
>
  <Radio.Root value="a" id="radio-a" data-testid="a">A</Radio.Root>
  <Radio.Root value="b" id="radio-b" data-testid="b">B</Radio.Root>
</RadioGroup>
<label for="radio-b" data-testid="label-b">B</label>
