<script lang="ts">
  import { Drawer } from '@shardsui/svelte/drawer'
  import { ScrollArea } from '@shardsui/svelte/scroll-area'

  const PRIMARY_LINKS = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/activity', label: 'Activity' }
  ]

  const TOPICS = [
    'Design Systems',
    'Typography',
    'Color',
    'Layout',
    'Responsive',
    'Accessibility',
    'Motion',
    'Tokens',
    'Spacing',
    'Grid',
    'Theming',
    'Dark Mode',
    'Iconography',
    'Components',
    'Variants',
    'Composition',
    'Primitives',
    'Reactivity',
    'State',
    'Interaction',
    'Prototyping',
    'Performance',
    'Bundle Size',
    'Testing',
    'Documentation',
    'Handoff',
    'Versioning',
    'Changelogs',
    'Governance',
    'Contribution'
  ]
</script>

<Drawer.Root>
  <Drawer.Trigger
    class="m-0 box-border flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm/6 font-normal text-gray-900 outline-hidden select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    Open mobile menu
  </Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop
      class="data-ending-style:backdrop-blur-0 data-starting-style:backdrop-blur-0 fixed inset-0 min-h-dvh bg-black/10 opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] backdrop-blur-xs transition-[backdrop-filter,opacity] duration-600 ease-(--ease-out-fast) [--backdrop-opacity:1] data-ending-style:opacity-0 data-ending-style:duration-350 data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Drawer.Viewport class="group fixed inset-0">
      <ScrollArea.Root
        class="box-border h-full overscroll-contain transition-[transform,translate] duration-600 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-ending-style:pointer-events-none group-data-starting-style:translate-y-[100dvh]"
      >
        <ScrollArea.Viewport class="box-border h-full touch-auto overscroll-contain">
          <ScrollArea.Content class="flex min-h-full items-end justify-center pt-8 md:p-16">
            <Drawer.Popup
              class="group box-border w-full max-w-2xl transform-[translateY(var(--drawer-swipe-movement-y))] outline-hidden transition-transform duration-600 ease-[cubic-bezier(0.45,1.005,0,1.005)] data-ending-style:transform-[translateY(calc(max(100dvh,100%)+2px))] data-ending-style:duration-350 data-ending-style:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] data-swiping:select-none"
            >
              <nav
                aria-label="Navigation"
                class="relative flex flex-col rounded-t-2xl bg-gray-50 px-6 pt-4 pb-6 text-gray-900 shadow-2xl outline-1 outline-gray-200 transition-shadow duration-350 ease-[cubic-bezier(0.375,0.015,0.545,0.455)] group-data-ending-style:shadow-none md:rounded-xl"
              >
                <div class="mb-3 grid grid-cols-[1fr_auto_1fr] items-center">
                  <div aria-hidden="true" class="size-8"></div>
                  <div class="h-1 w-12 justify-self-center rounded-full bg-gray-300"></div>
                  <Drawer.Close
                    aria-label="Close menu"
                    class="flex size-8 items-center justify-center justify-self-end rounded-full border border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
                  >
                    {@render crossIcon()}
                  </Drawer.Close>
                </div>

                <Drawer.Content class="w-full">
                  <Drawer.Title class="m-0 mb-1 text-base/7 font-semibold tracking-normal">
                    Menu
                  </Drawer.Title>
                  <Drawer.Description class="m-0 mb-5 text-sm/6 text-gray-600">
                    Scroll the list. Flick down from the top to dismiss.
                  </Drawer.Description>

                  <div class="pb-8">
                    <ul class="m-0 grid list-none gap-1 p-0">
                      {#each PRIMARY_LINKS as item (item.label)}
                        <li class="flex">
                          <a
                            class="w-full rounded-xl bg-gray-100 px-4 py-3 text-gray-900 no-underline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950"
                            href={item.href}
                          >
                            {item.label}
                          </a>
                        </li>
                      {/each}
                    </ul>

                    <ul aria-label="Topics" class="m-0 mt-6 grid list-none gap-1 p-0">
                      {#each TOPICS as topic (topic)}
                        <li class="flex">
                          <a
                            class="w-full rounded-xl bg-gray-100 px-4 py-3 text-gray-900 no-underline focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950"
                            href="/products"
                          >
                            {topic}
                          </a>
                        </li>
                      {/each}
                    </ul>
                  </div>
                </Drawer.Content>
              </nav>
            </Drawer.Popup>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          class="pointer-events-none absolute m-1.5 flex w-1 justify-center rounded-2xl opacity-0 transition-opacity duration-250 hover:pointer-events-auto hover:opacity-100 hover:delay-0 hover:duration-75 data-ending-style:opacity-0 data-ending-style:duration-250 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:delay-0 data-scrolling:duration-75 md:w-1.75"
        >
          <ScrollArea.Thumb
            class="w-full rounded-[inherit] bg-gray-500 before:absolute before:top-1/2 before:left-1/2 before:size-[calc(100%+1rem)] before:-translate-1/2 before:content-['']"
          />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>

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
