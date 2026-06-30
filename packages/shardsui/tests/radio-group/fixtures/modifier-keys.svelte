<script lang="ts">
  import { DirectionProvider, type TextDirection } from '$lib/components/direction-provider'
  import { RadioGroup } from '$lib/components/radio-group'
  import { Radio } from '$lib/components/radio'

  let { direction = 'ltr' }: { direction?: TextDirection } = $props()
</script>

<DirectionProvider {direction}>
  <RadioGroup>
    <Radio.Root value="a" data-testid="a" />
    <Radio.Root value="b" data-testid="b" />
    <Radio.Root value="c" data-testid="c" />
  </RadioGroup>
</DirectionProvider>
