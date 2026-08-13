<script lang="ts">
  import { Slider } from '@shardsui/svelte/slider'
</script>

<Slider.Root orientation="vertical" value={60}>
  <Slider.Control class="flex h-32 touch-none px-3 select-none">
    <Slider.Track class="h-full w-1 rounded-sm bg-gray-50 inset-ring inset-ring-gray-200">
      <Slider.Indicator class="rounded-sm bg-gray-700" />
      <Slider.Thumb
        aria-label="Volume"
        class="size-4 rounded-full bg-gray-50 outline-1 outline-gray-300 has-focus-visible:outline-2 has-focus-visible:outline-gray-950"
      />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
