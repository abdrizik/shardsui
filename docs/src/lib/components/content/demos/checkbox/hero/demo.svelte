<script lang="ts">
  import { Checkbox } from '@shardsui/svelte/checkbox'
</script>

<label class="flex items-center gap-2 text-sm font-normal text-gray-900">
  <Checkbox.Root
    checked
    class="flex size-4 shrink-0 items-center justify-center rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 data-checked:bg-gray-900 data-unchecked:border data-unchecked:border-gray-300"
  >
    <Checkbox.Indicator class="flex text-gray-50 data-unchecked:hidden">
      {@render checkIcon()}
    </Checkbox.Indicator>
  </Checkbox.Root>
  Remind me to practice daily
</label>

{#snippet checkIcon()}
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-4">
    <path
      d="M6 14.15L10.0321 18L18 7"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}
