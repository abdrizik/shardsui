<script lang="ts">
  import { NavigationMenu } from '@shardsui/svelte/navigation-menu'
  import { MediaQuery } from 'svelte/reactivity'

  const desktop = new MediaQuery('(min-width: 700px)')

  const collections = [
    {
      value: 'getting-started',
      label: 'Getting started',
      hint: 'Start from zero.',
      title: 'Build a foundation',
      description: 'Short guides for your first steps.',
      links: [
        {
          href: '#',
          title: 'Installation',
          description: 'Set up the library in your project.'
        },
        {
          href: '#',
          title: 'Quick start',
          description: 'Compose your first component.'
        }
      ]
    },
    {
      value: 'components',
      label: 'Components',
      hint: 'Explore the parts.',
      title: 'Browse the catalog',
      description: 'Every component, documented and ready to use.',
      links: [
        {
          href: '#',
          title: 'Dialog',
          description: 'Modal overlays with focus management.'
        },
        {
          href: '#',
          title: 'Popover',
          description: 'Floating panels anchored to a trigger.'
        }
      ]
    },
    {
      value: 'advanced',
      label: 'Advanced',
      hint: 'Go deeper.',
      title: 'Customize behavior',
      description: 'Handles, detached triggers, and composition patterns.',
      links: [
        {
          href: '#',
          title: 'Detached triggers',
          description: 'Share one popup across multiple triggers.'
        },
        {
          href: '#',
          title: 'State factories',
          description: 'How internal state is structured.'
        }
      ]
    }
  ]
</script>

<NavigationMenu.Root class="min-w-max rounded-lg bg-gray-50 p-1 text-gray-900">
  <NavigationMenu.List class="relative flex gap-px">
    <NavigationMenu.Item>
      <NavigationMenu.Trigger
        class="m-0 box-border flex h-8 items-center justify-center gap-1.5 rounded-md bg-gray-50 px-2 text-sm/6 font-normal text-gray-900 no-underline select-none hover:bg-gray-100 focus-visible:relative focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 data-popup-open:bg-gray-100 sm:px-3 sm:text-sm"
      >
        Browse
        <NavigationMenu.Icon
          class="transition-transform duration-200 ease-[ease] data-popup-open:rotate-180"
        >
          {@render chevronDownIcon()}
        </NavigationMenu.Icon>
      </NavigationMenu.Trigger>

      <NavigationMenu.Content
        class="h-full w-[calc(100vw-40px)] p-0 transition-[opacity,translate] duration-[calc(var(--duration)*0.5),var(--duration)] ease-[ease,cubic-bezier(0.4,0,0.2,1)] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--duration)*0.5)] data-ending-style:ease-[ease] data-ending-style:data-[activation-direction=left]:translate-x-8 data-starting-style:data-[activation-direction=left]:-translate-x-8 data-starting-style:data-[activation-direction=left]:opacity-0 data-ending-style:data-[activation-direction=right]:-translate-x-8 data-starting-style:data-[activation-direction=right]:translate-x-8 data-starting-style:data-[activation-direction=right]:opacity-0 min-[700px]:max-w-168.75"
      >
        <NavigationMenu.Root
          class="overflow-hidden text-gray-900"
          orientation={desktop.current ? 'vertical' : 'horizontal'}
          value="getting-started"
        >
          <div
            class="grid grid-cols-1 overflow-clip rounded-lg min-[700px]:grid-cols-[13rem_minmax(0,1fr)]"
          >
            <NavigationMenu.List
              class="m-0 flex list-none flex-row gap-1 overflow-x-auto bg-gray-100 p-4 min-[700px]:box-border min-[700px]:h-(--popup-height) min-[700px]:flex-col min-[700px]:gap-px min-[700px]:overflow-x-visible min-[700px]:overflow-y-auto min-[700px]:border-r min-[700px]:border-r-gray-200 min-[700px]:transition-[height] min-[700px]:duration-(--duration) min-[700px]:ease-(--easing)"
            >
              {#each collections as menu (menu.value)}
                <NavigationMenu.Item value={menu.value}>
                  <NavigationMenu.Trigger
                    class="m-0 box-border flex w-full min-w-40 flex-col items-start gap-0.5 rounded-lg bg-transparent px-3 py-2.5 text-left text-inherit hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-popup-open:bg-gray-50 data-popup-open:shadow-sm"
                  >
                    <span class="text-sm leading-tight font-normal text-gray-900">{menu.label}</span
                    >
                    <span class="text-sm leading-snug text-gray-500">{menu.hint}</span>
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content
                    class="min-[700px]:blur-0 h-full translate-x-0 p-7 transition-[opacity,translate,filter] duration-(--duration) ease-(--easing) data-ending-style:opacity-0 data-ending-style:data-[activation-direction=left]:translate-x-1/2 data-starting-style:data-[activation-direction=left]:-translate-x-1/2 data-starting-style:data-[activation-direction=left]:opacity-0 data-ending-style:data-[activation-direction=right]:-translate-x-1/2 data-starting-style:data-[activation-direction=right]:translate-x-1/2 data-starting-style:data-[activation-direction=right]:opacity-0 min-[700px]:p-8 min-[700px]:duration-[calc(var(--duration)*1.35)] min-[700px]:ease-out-expo min-[700px]:data-ending-style:blur-[2px] min-[700px]:data-starting-style:blur-[2px] min-[700px]:data-ending-style:data-[activation-direction=down]:-translate-y-18 min-[700px]:data-starting-style:data-[activation-direction=down]:translate-y-18 min-[700px]:data-starting-style:data-[activation-direction=down]:opacity-0 min-[700px]:data-ending-style:data-[activation-direction=up]:translate-y-18 min-[700px]:data-starting-style:data-[activation-direction=up]:-translate-y-18 min-[700px]:data-starting-style:data-[activation-direction=up]:opacity-0"
                  >
                    <h4 class="m-0 text-base leading-tight font-normal">{menu.title}</h4>
                    <p class="m-0 mt-2.5 text-sm text-gray-500">{menu.description}</p>
                    <ul class="m-0 -mx-2 mt-4 grid list-none gap-0 p-0">
                      {#each menu.links as link (link.title)}
                        <li>
                          <NavigationMenu.Link
                            class="box-border block rounded-lg bg-transparent px-2 py-3 text-inherit no-underline hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950"
                            href={link.href}
                          >
                            <h5 class="m-0 text-sm/4.5 font-normal">{link.title}</h5>
                            <p class="m-0 mt-1.5 text-sm leading-normal text-gray-500">
                              {link.description}
                            </p>
                          </NavigationMenu.Link>
                        </li>
                      {/each}
                    </ul>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              {/each}
            </NavigationMenu.List>
            <NavigationMenu.Viewport
              class="relative min-h-66 overflow-hidden border-t border-gray-200 min-[700px]:border-t-0"
            />
          </div>
        </NavigationMenu.Root>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item>
      <NavigationMenu.Link
        class="m-0 box-border flex h-8 items-center justify-center gap-1.5 rounded-md bg-gray-50 px-2 text-sm/6 font-normal text-gray-900 no-underline select-none hover:bg-gray-100 focus-visible:relative focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 sm:px-3 sm:text-sm"
        href="#">Pricing</NavigationMenu.Link
      >
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner
      sideOffset={10}
      collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
      collisionAvoidance={{ side: 'none' }}
      class="box-border h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-(--duration) ease-(--easing) before:absolute before:content-[''] data-instant:transition-none data-[side=bottom]:before:inset-x-0 data-[side=bottom]:before:-top-2.5 data-[side=bottom]:before:h-2.5 data-[side=left]:before:inset-y-0 data-[side=left]:before:-right-2.5 data-[side=left]:before:w-2.5 data-[side=right]:before:inset-y-0 data-[side=right]:before:-left-2.5 data-[side=right]:before:w-2.5 data-[side=top]:before:inset-x-0 data-[side=top]:before:-bottom-2.5 data-[side=top]:before:h-2.5"
      style="--duration:0.35s;--easing:cubic-bezier(0.22,1,0.36,1);"
    >
      <NavigationMenu.Popup
        class="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg bg-gray-50 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[opacity,scale,width,height] duration-(--duration) ease-(--easing) data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:transition-[opacity,scale] data-ending-style:duration-150 data-ending-style:ease-[ease] data-starting-style:scale-95 data-starting-style:opacity-0"
      >
        <NavigationMenu.Arrow
          class="flex transition-[left] duration-(--duration) ease-(--easing) data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
        >
          {@render arrow()}
        </NavigationMenu.Arrow>
        <NavigationMenu.Viewport class="relative size-full overflow-hidden" />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>

{#snippet chevronDownIcon()}
  <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5.75 9.5L12 15.75L18.25 9.5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet arrow()}
  <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
    <path
      d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
      class="fill-gray-50"
    />
    <path
      d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
      class="fill-gray-200"
    />
    <path
      d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
    />
  </svg>
{/snippet}
