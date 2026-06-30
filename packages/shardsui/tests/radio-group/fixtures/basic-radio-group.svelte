<script lang="ts">
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'
  let {
    value = $bindable(),
    onValueChange = undefined,
    disabled = false,
    readOnly = false,
    required = false,
    name = undefined
  } = $props()
</script>

<RadioGroup {value} {onValueChange} {disabled} {readOnly} {required} {name}>
  <Radio.Root value="a" data-testid="radio-a">Option A<Radio.Indicator /></Radio.Root>
  <Radio.Root value="b" data-testid="radio-b">Option B<Radio.Indicator /></Radio.Root>
  <Radio.Root value="c" data-testid="radio-c">Option C<Radio.Indicator /></Radio.Root>
</RadioGroup>
