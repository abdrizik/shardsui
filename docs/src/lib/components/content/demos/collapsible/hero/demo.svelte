<script lang="ts">
  import { Collapsible } from '@shardsui/svelte/collapsible'
</script>

<Collapsible.Root class="flex w-72 flex-col text-sm">
  <p class="m-0 text-gray-600">
    Learn how type is set — choosing a type scale, tuning leading, and spacing letters with tracking
    so text reads cleanly.
  </p>
  <Collapsible.Panel
    class="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-150 ease-out data-ending-style:h-0 data-starting-style:h-0"
  >
    <p class="m-0 pt-2 text-gray-600">
      Build a modular type scale, balance leading against line length, and match x-heights when
      pairing typefaces.
    </p>
  </Collapsible.Panel>
  <Collapsible.Trigger
    class="mt-3 self-center rounded-xs text-sm font-medium text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
  >
    {#snippet children({ open })}
      {open ? 'Show less' : 'Show more'}
    {/snippet}
  </Collapsible.Trigger>
</Collapsible.Root>
