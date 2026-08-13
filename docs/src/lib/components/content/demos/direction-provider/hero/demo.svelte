<script lang="ts">
  import { Slider } from '@shardsui/svelte/slider'
  import { DirectionProvider } from '@shardsui/svelte/direction-provider'
</script>

<div dir="rtl">
  <DirectionProvider direction="rtl">
    <Slider.Root value={40} class="w-56">
      <div class="flex items-center justify-between">
        <Slider.Label class="text-sm font-medium text-gray-900 select-none">السطوع</Slider.Label>
        <Slider.Value class="text-sm text-gray-600 select-none" />
      </div>
      <Slider.Control class="flex w-full touch-none items-center py-3 select-none">
        <Slider.Track
          class="h-1 w-full rounded-sm bg-gray-50 inset-ring inset-ring-gray-200 select-none"
        >
          <Slider.Indicator class="rounded-sm bg-gray-700 select-none" />
          <Slider.Thumb
            class="size-4 rounded-full bg-gray-50 outline-1 outline-gray-300 select-none has-focus-visible:outline-2 has-focus-visible:outline-gray-950"
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  </DirectionProvider>
</div>
