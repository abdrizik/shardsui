<script lang="ts">
  import { ScrollArea } from '@shardsui/svelte/scroll-area'
</script>

<ScrollArea.Root class="h-34 w-96 max-w-[calc(100vw-8rem)]">
  <ScrollArea.Viewport
    class="h-full rounded-md outline-1 -outline-offset-1 outline-gray-200 focus-visible:outline-2 focus-visible:outline-gray-950"
  >
    <ScrollArea.Content class="flex flex-col gap-4 py-3 pr-6 pl-4 text-sm/5.5 text-gray-900">
      <p>
        Reaching for a div and styling it into a button is where most accessibility debt starts. A
        native button ships with a role, keyboard activation, focus management, and form
        participation — none of which survive when you swap in a generic element.
      </p>
      <p>
        Rebuilding that contract by hand is deceptively deep: a tabindex to make it focusable, a
        keydown handler that fires on Enter but waits for Space on keyup to match native behavior,
        aria-pressed where state applies, and a focus-visible ring that only shows for keyboard
        users. Miss one and it works for you but not for a screen reader.
      </p>
      <p>
        The rule that scales: start from the most semantic element that fits, and reach for ARIA
        only when the platform gives you nothing — a combobox, a tablist, a disclosure. ARIA is a
        promise you have to keep in code; semantic HTML keeps it for you.
      </p>
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar
    class="pointer-events-none m-2 flex w-1 justify-center rounded-sm bg-gray-200 opacity-0 transition-opacity data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
  >
    <ScrollArea.Thumb class="w-full rounded-sm bg-gray-500" />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
