<script lang="ts">
  import { NavigationMenu } from '@shardsui/svelte/navigation-menu'

  type LinkItem = { href: string; title: string; description: string }

  const topics: LinkItem[] = [
    {
      href: '#',
      title: 'Frontend',
      description: 'From first components to full working apps.'
    },
    { href: '#', title: 'Design', description: 'Type scale, color tokens, and layout grids.' },
    {
      href: '#',
      title: 'Accessibility',
      description: 'Semantic HTML, ARIA, and keyboard nav.'
    },
    { href: '#', title: 'Motion', description: 'Easing, timing, and interface animation.' }
  ]

  const resources: LinkItem[] = [
    {
      href: '#',
      title: 'Docs',
      description: 'Guides and reference for every feature.'
    },
    { href: '#', title: 'Changelog', description: 'What shipped and when.' },
    { href: '#', title: 'Blog', description: 'Updates, tips, and release notes.' }
  ]
</script>

<NavigationMenu.Root class="min-w-max rounded-lg bg-gray-50 p-1 text-gray-900">
  <NavigationMenu.List class="relative flex gap-px">
    <NavigationMenu.Item>
      <NavigationMenu.Trigger
        class="flex h-8 items-center justify-center gap-1.5 rounded-md bg-gray-50 px-2 text-sm font-normal text-gray-900 no-underline select-none hover:bg-gray-100 focus-visible:relative focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 data-popup-open:bg-gray-100 min-[501px]:px-3"
      >
        Products
        <NavigationMenu.Icon
          class="transition-transform duration-200 ease-[ease] data-popup-open:rotate-180"
        >
          {@render chevronDownIcon()}
        </NavigationMenu.Icon>
      </NavigationMenu.Trigger>

      <NavigationMenu.Content
        class="h-full w-[calc(100vw-40px)] p-4 transition-[opacity,translate] duration-[calc(var(--duration)*0.5),var(--duration)] ease-[ease,var(--easing)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:data-[activation-direction=left]:translate-x-1/2 data-starting-style:data-[activation-direction=left]:-translate-x-1/2 data-ending-style:data-[activation-direction=right]:-translate-x-1/2 data-starting-style:data-[activation-direction=right]:translate-x-1/2 min-[500px]:w-max min-[500px]:min-w-100"
      >
        <ul class="grid list-none grid-cols-1 min-[500px]:grid-cols-[13rem_13rem]">
          {#each topics as item (item.title)}
            {@render card(item)}
          {/each}
        </ul>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item>
      <NavigationMenu.Trigger
        class="flex h-8 items-center justify-center gap-1.5 rounded-md bg-gray-50 px-2 text-sm font-normal text-gray-900 no-underline select-none hover:bg-gray-100 focus-visible:relative focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 data-popup-open:bg-gray-100 min-[501px]:px-3"
      >
        Resources
        <NavigationMenu.Icon
          class="transition-transform duration-200 ease-[ease] data-popup-open:rotate-180"
        >
          {@render chevronDownIcon()}
        </NavigationMenu.Icon>
      </NavigationMenu.Trigger>

      <NavigationMenu.Content
        class="h-full w-[calc(100vw-40px)] p-4 transition-[opacity,translate] duration-[calc(var(--duration)*0.5),var(--duration)] ease-[ease,var(--easing)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:data-[activation-direction=left]:translate-x-1/2 data-starting-style:data-[activation-direction=left]:-translate-x-1/2 data-ending-style:data-[activation-direction=right]:-translate-x-1/2 data-starting-style:data-[activation-direction=right]:translate-x-1/2 min-[500px]:w-max min-[500px]:min-w-100"
      >
        <ul class="flex max-w-100 list-none flex-col justify-center">
          {#each resources as item (item.title)}
            {@render card(item)}
          {/each}
        </ul>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item>
      <NavigationMenu.Link
        class="flex h-8 items-center justify-center gap-1.5 rounded-md bg-gray-50 px-2 text-sm font-normal text-gray-900 no-underline select-none hover:bg-gray-100 focus-visible:relative focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100 min-[501px]:px-3"
        href="#">Pricing</NavigationMenu.Link
      >
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner
      sideOffset={10}
      collisionPadding={{ top: 5, bottom: 5, left: 20, right: 20 }}
      collisionAvoidance={{ side: 'none' }}
      style="--duration:0.35s;--easing:cubic-bezier(0.22, 1, 0.36, 1);"
      class="box-border h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-(--duration) ease-(--easing) before:absolute before:content-[''] data-instant:transition-none data-[side=bottom]:before:inset-x-0 data-[side=bottom]:before:-top-2.5 data-[side=bottom]:before:h-2.5 data-[side=left]:before:inset-y-0 data-[side=left]:before:-right-2.5 data-[side=left]:before:w-2.5 data-[side=right]:before:inset-y-0 data-[side=right]:before:-left-2.5 data-[side=right]:before:w-2.5 data-[side=top]:before:inset-x-0 data-[side=top]:before:-bottom-2.5 data-[side=top]:before:h-2.5"
    >
      <NavigationMenu.Popup
        class="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg bg-gray-50 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[opacity,transform,width,height,scale] duration-(--duration) ease-(--easing) data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-ending-style:ease-[ease] data-starting-style:scale-90 data-starting-style:opacity-0"
      >
        <NavigationMenu.Arrow
          class="flex transition-[left,right] duration-(--duration) ease-(--easing) data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
        >
          {@render arrow()}
        </NavigationMenu.Arrow>
        <NavigationMenu.Viewport class="relative size-full overflow-hidden rounded-[inherit]" />
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

{#snippet card(item: LinkItem)}
  <li>
    <NavigationMenu.Link
      href={item.href}
      class="relative block size-full rounded-md p-2 text-left text-inherit no-underline hover:bg-gray-100 focus-visible:relative focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 min-[501px]:p-3"
    >
      <h3 class="m-0 mb-1 text-sm leading-4 font-normal">{item.title}</h3>
      <p class="m-0 text-sm/5 text-gray-500">{item.description}</p>
    </NavigationMenu.Link>
  </li>
{/snippet}
