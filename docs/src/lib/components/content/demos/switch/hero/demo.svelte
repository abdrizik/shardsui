<script lang="ts">
  import { Switch } from '@shardsui/svelte/switch'
</script>

<label class="flex items-center gap-2 text-sm font-normal text-gray-900 select-none">
  <Switch.Root
    checked
    class="flex h-5 w-9 rounded-md bg-gray-300 p-px inset-shadow-xs outline-offset-2 outline-gray-950 transition-colors duration-150 focus-visible:outline-2 data-checked:bg-emerald-600"
  >
    <Switch.Thumb
      class="aspect-square h-full rounded-[calc(var(--radius-md)-1px)] bg-white shadow-sm transition-transform duration-150 data-checked:translate-x-4"
    />
  </Switch.Root>

  Autoplay
</label>
