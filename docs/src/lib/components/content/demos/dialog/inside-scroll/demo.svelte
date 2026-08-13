<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'
  import { ScrollArea } from '@shardsui/svelte/scroll-area'

  const SECTIONS = [
    {
      title: 'Kerning',
      body: 'The space between two specific characters, adjusted manually — different from tracking, which affects all characters equally.'
    },
    {
      title: 'Tracking',
      body: 'Letter-spacing applied uniformly across a word or block of text. Uppercase labels almost always need more of it.'
    },
    {
      title: 'Leading',
      body: 'The vertical space between lines of text. Too tight and text suffocates; too loose and it stops reading as a paragraph.'
    },
    {
      title: 'Type scale',
      body: 'A predetermined set of font sizes that work together, usually based on a ratio, so hierarchy stays consistent.'
    },
    {
      title: 'Hierarchy',
      body: 'The ranking of elements by importance. Without it, everything competes and nothing wins.'
    },
    {
      title: 'Negative space',
      body: 'The empty area around and between elements. It defines shape, creates breathing room, and guides the eye.'
    },
    {
      title: 'Gap',
      body: 'Space between flex or grid children, set on the parent. Unlike margin, it leaves no trailing space after the last item.'
    },
    {
      title: 'Baseline grid',
      body: 'A horizontal rhythm built from the line-height of body text, keeping editorial layouts consistent.'
    },
    {
      title: 'Border radius',
      body: 'The rounding on a corner. An inner element needs a smaller radius — outer radius minus padding — or a gap appears.'
    },
    {
      title: 'Contrast ratio',
      body: 'The luminance difference between foreground and background. WCAG asks for 4.5:1 on body text, 3:1 on large text and UI.'
    },
    {
      title: 'Easing',
      body: 'The rate an animation speeds up or slows down. Ease-out decelerates into place and feels natural.'
    },
    {
      title: 'Focus state',
      body: 'The visible indicator that an element is keyboard-focused. Removing it is an accessibility failure.'
    },
    {
      title: 'Affordance',
      body: 'The visual signal that tells you how something can be used. A button looks pressable; a link looks clickable.'
    },
    {
      title: 'Optical centre',
      body: 'Where something looks centred versus where it mathematically is — a play button centred by coordinates looks left-heavy.'
    }
  ]
</script>

<Dialog.Root>
  <Dialog.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    Open glossary
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop
      class="fixed inset-0 bg-black opacity-20 transition-opacity duration-250 ease-[cubic-bezier(0.45,1.005,0,1.005)] data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Dialog.Viewport
      class="fixed inset-0 flex items-center justify-center overflow-hidden py-6 [@media(min-height:600px)]:pt-8 [@media(min-height:600px)]:pb-12"
    >
      <Dialog.Popup
        class="relative flex max-h-full min-h-0 w-[min(40rem,calc(100vw-2rem))] max-w-full flex-col overflow-hidden rounded-lg bg-gray-50 p-8 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
      >
        <Dialog.Title class="m-0 text-base font-semibold">Design glossary</Dialog.Title>
        <Dialog.Description class="m-0 mb-4 text-sm/[1.6rem] text-gray-600">
          Key terms, briefly defined.
        </Dialog.Description>
        <ScrollArea.Root
          class="relative flex min-h-0 flex-1 overflow-hidden before:absolute before:top-0 before:h-px before:w-full before:bg-gray-200 before:content-[''] after:absolute after:bottom-0 after:h-px after:w-full after:bg-gray-200 after:content-['']"
        >
          <ScrollArea.Viewport
            class="min-h-0 flex-1 overflow-y-auto overscroll-contain py-6 pr-6 pl-1 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-gray-950"
          >
            <ScrollArea.Content class="flex flex-col gap-4">
              {#each SECTIONS as item (item.title)}
                <section>
                  <h3 class="mb-1.5 text-sm/6 font-semibold">{item.title}</h3>
                  <p class="m-0 text-sm/[1.55rem] text-gray-700">{item.body}</p>
                </section>
              {/each}
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            class="pointer-events-none absolute m-1 flex w-1 justify-center rounded-lg opacity-0 transition-opacity duration-250 data-hovering:pointer-events-auto data-hovering:opacity-100 data-hovering:duration-75 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-75 md:w-1.5"
          >
            <ScrollArea.Thumb
              class="w-full rounded-[inherit] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:size-[calc(100%+1rem)] before:-translate-1/2 before:content-['']"
            />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
        <div class="mt-4 flex justify-end">
          <Dialog.Close
            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
          >
            Close
          </Dialog.Close>
        </div>
      </Dialog.Popup>
    </Dialog.Viewport>
  </Dialog.Portal>
</Dialog.Root>
