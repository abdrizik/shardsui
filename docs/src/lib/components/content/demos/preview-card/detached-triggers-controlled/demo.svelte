<script lang="ts">
  import type { Snippet } from 'svelte'
  import { PreviewCard } from '@shardsui/svelte/preview-card'

  const demoPreviewCard = new PreviewCard.Handle<Snippet>()

  let open = $state(false)
  let triggerId = $state<string | null>(null)
</script>

<div class="flex flex-wrap items-baseline justify-center gap-2">
  <p class="m-0 text-sm/6 text-balance text-gray-900">
    Explore
    <PreviewCard.Trigger
      class="text-gray-950 underline decoration-gray-950/60 decoration-1 underline-offset-2 outline-0 hover:decoration-gray-950 focus-visible:rounded-xs focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-gray-950 data-popup-open:decoration-gray-950"
      handle={demoPreviewCard}
      href="https://en.wikipedia.org/wiki/Mars"
      id="trigger-mars"
      payload={mars}
    >
      Mars
    </PreviewCard.Trigger>
    ,
    <PreviewCard.Trigger
      class="text-gray-950 underline decoration-gray-950/60 decoration-1 underline-offset-2 outline-0 hover:decoration-gray-950 focus-visible:rounded-xs focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-gray-950 data-popup-open:decoration-gray-950"
      handle={demoPreviewCard}
      href="https://en.wikipedia.org/wiki/Saturn"
      id="trigger-saturn"
      payload={saturn}
    >
      Saturn
    </PreviewCard.Trigger>
    , or
    <PreviewCard.Trigger
      class="text-gray-950 underline decoration-gray-950/60 decoration-1 underline-offset-2 outline-0 hover:decoration-gray-950 focus-visible:rounded-xs focus-visible:no-underline focus-visible:outline-2 focus-visible:outline-gray-950 data-popup-open:decoration-gray-950"
      handle={demoPreviewCard}
      href="https://en.wikipedia.org/wiki/Neptune"
      id="trigger-neptune"
      payload={neptune}
    >
      Neptune
    </PreviewCard.Trigger>
    .
  </p>
  <button
    type="button"
    class="font-inherit m-0 box-border flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm/6 font-normal text-gray-900 outline-0 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
    onclick={() => {
      triggerId = 'trigger-neptune'
      open = true
    }}
  >
    Open programmatically
  </button>
</div>

<PreviewCard.Root handle={demoPreviewCard} bind:open bind:triggerId>
  {#snippet children({ payload })}
    <PreviewCard.Portal>
      <PreviewCard.Positioner
        sideOffset={8}
        class="h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)"
      >
        <PreviewCard.Popup
          class="box-border h-(--popup-height,auto) w-(--popup-width,auto) origin-(--transform-origin) rounded-lg bg-gray-50 shadow-lg outline-1 outline-gray-200 transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
        >
          <PreviewCard.Arrow
            class="flex data-[side=bottom]:-top-2 data-[side=left]:-right-3.25 data-[side=left]:rotate-90 data-[side=right]:-left-3.25 data-[side=right]:-rotate-90 data-[side=top]:-bottom-2 data-[side=top]:rotate-180"
          >
            {@render arrow()}
          </PreviewCard.Arrow>

          {@render payload?.()}
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  {/snippet}
</PreviewCard.Root>

{#snippet planet(name: string, gradient: string, fact: string)}
  <div class="box-border flex w-56 flex-col items-center gap-2 p-2">
    <div class="size-36 rounded-full" style="background: {gradient}" aria-hidden="true"></div>
    <p class="m-0 self-stretch text-sm/5 text-pretty text-gray-900">
      <strong>{name}</strong>
      {fact}
    </p>
  </div>
{/snippet}

{#snippet mars()}
  {@render planet(
    'Mars',
    'radial-gradient(circle at 32% 28%, #e79c7e 0%, #c0472a 45%, #712411 100%)',
    'is a cold desert world of red dust and rock.'
  )}
{/snippet}

{#snippet neptune()}
  {@render planet(
    'Neptune',
    'radial-gradient(circle at 32% 28%, #7fb0ee 0%, #2f5fc4 45%, #14306e 100%)',
    'is the farthest planet, a ball of ice with winds faster than sound.'
  )}
{/snippet}

{#snippet saturn()}
  {@render planet(
    'Saturn',
    'radial-gradient(circle at 32% 28%, #f8efcd 0%, #e3ce85 45%, #a8934a 100%)',
    'is the second largest planet, a pale gas giant so light it would float, wrapped in bright rings of ice.'
  )}
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
  </svg>
{/snippet}
