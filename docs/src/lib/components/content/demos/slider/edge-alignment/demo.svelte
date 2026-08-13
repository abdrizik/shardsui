<script lang="ts">
  import { Slider } from '@shardsui/svelte/slider'
</script>

<Slider.Root thumbAlignment="edge" value={100} class="w-56">
  <Slider.Control class="flex w-full touch-none items-center py-3 select-none">
    <Slider.Track class="h-1 w-full rounded-sm bg-gray-50 inset-ring inset-ring-gray-200">
      <Slider.Indicator class="rounded-sm bg-gray-700" />
      <Slider.Thumb
        aria-label="Opacity"
        class="size-4 rounded-full bg-gray-50 outline-1 outline-gray-300 has-focus-visible:outline-2 has-focus-visible:outline-gray-950"
      />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
