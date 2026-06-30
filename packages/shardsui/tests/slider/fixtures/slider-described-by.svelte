<script lang="ts">
  import { Slider } from '$lib/components/slider'
  import { Field } from '$lib/components/field'
</script>

<Field.Root>
  <Slider.Root data-testid="slider" aria-describedby="external-description">
    <Slider.Control>
      <Slider.Track>
        <Slider.Thumb />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
  <Field.Description data-testid="description">Adjust the volume</Field.Description>
</Field.Root>
