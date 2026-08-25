<script lang="ts">
  import { Slider } from '$lib/components/slider'
  import { Field } from '$lib/components/field'
  import type { FieldValidator } from '$lib/components/field/field.svelte'

  let {
    validate = () => null
  }: {
    validate?: FieldValidator
  } = $props()

  let value = $state(0)
</script>

<Field.Root validationMode="onChange" {validate} name="volume">
  <Slider.Root
    {value}
    onValueChange={(next) => {
      if (!Array.isArray(next)) value = next
    }}
  >
    <Slider.Control>
      <Slider.Track>
        <Slider.Thumb data-testid="thumb" />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
</Field.Root>
<button type="button" onclick={() => (value = 5)}>Set externally</button>
