<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'
  import { ScrollArea } from '@shardsui/svelte/scroll-area'

  const SECTIONS = [
    {
      title: '1. Semantic HTML',
      body: 'Reach for the element that already does the job: a button gives you keyboard events, focus, and role for free, where a styled div makes you rebuild all three.'
    },
    {
      title: '2. CSS architecture',
      body: 'Organize styles with cascade layers and clear naming so a growing codebase stays predictable instead of turning into a pile of overrides.'
    },
    {
      title: '3. The box model',
      body: 'Master margin, border, padding, and box-sizing, then nest an inner border radius as outer minus padding so corners line up cleanly.'
    },
    {
      title: '4. Flexbox',
      body: 'Arrange elements in a row or column, controlling direction, alignment, gap, and how items grow or shrink to fill the space.'
    },
    {
      title: '5. CSS grid',
      body: 'Build two-dimensional layouts on twelve columns with named areas that reflow cleanly from a phone to a wide desktop.'
    },
    {
      title: '6. Design tokens',
      body: 'Store color, type, and spacing decisions as semantic tokens — --color-border-subtle, not #e0e0e0 — so a theme change is one edit, not a hundred.'
    },
    {
      title: '7. Type scale',
      body: 'Pick sizes from a type scale, set leading that lets text breathe, and hold line length near 65 characters for a comfortable read.'
    },
    {
      title: '8. Contrast ratio',
      body: 'Build a color ramp in OKLCH and check every foreground and background pair against WCAG: 4.5:1 for body text, 3:1 for large text and UI.'
    },
    {
      title: '9. Responsive design',
      body: 'Design fluid layouts with clamp() type and set breakpoints where the content actually breaks, not at assumed device widths.'
    },
    {
      title: '10. Easing',
      body: 'Use ease-out for elements entering the screen and ease-in for ones leaving it, and honor reduced motion for anyone who prefers less movement.'
    },
    {
      title: '11. Focus states',
      body: 'Add a visible focus state, a logical tab order, and an aria-label that names the action, so custom widgets behave like the native ones they replace.'
    },
    {
      title: '12. Design handoff',
      body: 'Package tokens, states, and specs so the jump from Figma to production loses nothing in translation.'
    }
  ]

  let popupEl = $state<HTMLElement | null>(null)
</script>

<Dialog.Root>
  <Dialog.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    View details
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop
      class="data-ending-style:backdrop-blur-0 data-starting-style:backdrop-blur-0 fixed inset-0 bg-black/10 opacity-100 backdrop-blur-xs transition-[backdrop-filter,opacity] duration-600 ease-(--ease-out-fast) data-ending-style:opacity-0 data-ending-style:duration-350 data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Dialog.Viewport class="group/dialog fixed inset-0">
      <ScrollArea.Root
        class="h-full overscroll-contain group-data-ending-style/dialog:pointer-events-none"
      >
        <ScrollArea.Viewport
          class="h-full overscroll-contain group-data-ending-style/dialog:pointer-events-none"
        >
          <ScrollArea.Content class="flex min-h-full items-center justify-center">
            <Dialog.Popup
              bind:ref={popupEl}
              initialFocus={() => popupEl}
              class="relative mx-auto my-18 w-[min(40rem,calc(100vw-2rem))] rounded-lg bg-gray-50 p-6 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-transform duration-700 ease-[cubic-bezier(0.45,1.005,0,1.005)] data-ending-style:translate-y-[max(100dvh,100%)] data-ending-style:duration-350 data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] data-starting-style:translate-y-[100dvh] motion-reduce:transition-none"
            >
              <div class="mb-4 flex items-start justify-between gap-3">
                <Dialog.Title class="m-0 text-base font-semibold">Details</Dialog.Title>
                <Dialog.Close
                  aria-label="Close"
                  class="relative -top-2 -right-2 flex size-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
                >
                  {@render crossIcon()}
                </Dialog.Close>
              </div>

              <Dialog.Description class="m-0 mb-4 text-sm/[1.6rem] text-gray-600">
                Everything covered in this overview.
              </Dialog.Description>

              <div class="flex flex-col gap-4">
                {#each SECTIONS as item (item.title)}
                  <section>
                    <h3 class="m-0 mb-1.5 text-sm/6 font-semibold">{item.title}</h3>
                    <p class="m-0 text-sm/[1.55rem] text-gray-700">{item.body}</p>
                  </section>
                {/each}
              </div>
            </Dialog.Popup>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          class="pointer-events-none absolute m-1.5 flex w-1 justify-center rounded-lg opacity-0 transition-opacity duration-250 group-data-ending-style/dialog:opacity-0 group-data-ending-style/dialog:duration-300 hover:pointer-events-auto hover:opacity-100 hover:delay-0 hover:duration-75 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:delay-0 data-scrolling:duration-75 md:w-1.75"
        >
          <ScrollArea.Thumb
            class="w-full rounded-[inherit] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:size-[calc(100%+1rem)] before:-translate-1/2 before:content-['']"
          />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </Dialog.Viewport>
  </Dialog.Portal>
</Dialog.Root>

{#snippet crossIcon()}
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-4">
    <path
      d="M6.25 6.25L17.75 17.75M17.75 6.25L6.25 17.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
{/snippet}
