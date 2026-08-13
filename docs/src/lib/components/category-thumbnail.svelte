<script lang="ts">
  import type { Snippet } from 'svelte'

  let { slug }: { slug: string } = $props()
</script>

<div
  class="pointer-events-none flex h-52 items-center justify-center overflow-hidden rounded-lg bg-gray-100/60 px-6 py-5 select-none"
  aria-hidden="true"
>
  {#if slug === 'accordion'}
    <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
      <div class="flex-1 divide-y divide-gray-100">
        <div class="px-3 py-2.5">
          <div class="flex items-center gap-2">
            <div class="flex flex-1 flex-col gap-2">
              {@render bar('main', 'w-1/2')}
              {@render bar('secondary', 'w-11/12')}
            </div>
            {@render chevronDownIcon('rotate-180')}
          </div>
        </div>
        <div class="px-3 py-2.5">
          <div class="flex items-center justify-between gap-2">
            {@render bar('main', 'w-3/5')}
            {@render chevronDownIcon()}
          </div>
        </div>
      </div>
    </div>
  {:else if slug === 'alert-dialog'}
    {@render modalPreview(alertDialogBody)}
  {:else if slug === 'autocomplete'}
    <div class="flex max-w-56 flex-1 flex-col gap-2">
      <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
        <div class="flex flex-1 items-center px-3 py-2.5">
          {@render bar('main', 'w-2/5')}
        </div>
      </div>
      <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
        <div class="flex flex-1 flex-col gap-3 p-3">
          {@render bar('secondary', 'w-4/5')}
          {@render bar('secondary', 'w-3/5')}
          {@render bar('secondary', 'w-11/12')}
        </div>
      </div>
    </div>
  {:else if slug === 'avatar'}
    <div class="size-12 shrink-0 rounded-full bg-gray-200"></div>
  {:else if slug === 'button'}
    <div class="flex w-fit flex-col rounded-md bg-gray-900 px-3 py-2.5">
      {@render bar('inverse', 'w-10')}
    </div>
  {:else if slug === 'checkbox'}
    <div class="flex max-w-36 flex-1 flex-col gap-3">
      {@render checkboxItem(false, 'w-4/5')}
      {@render checkboxItem(true, 'w-3/5')}
    </div>
  {:else if slug === 'checkbox-group'}
    <div class="flex max-w-36 flex-1 flex-col gap-3">
      {@render checkboxItem(true, 'w-4/5')}
      {@render checkboxItem(true, 'w-3/5', 'ps-4')}
      {@render checkboxItem(false, 'w-11/12', 'ps-4')}
      {@render checkboxItem(false, 'w-2/3')}
    </div>
  {:else if slug === 'collapsible'}
    <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
      <div class="flex-1 divide-y divide-gray-100">
        <div class="flex items-center justify-between px-3 py-2.5">
          {@render bar('main', 'w-3/5')}
          {@render chevronDownIcon('rotate-180')}
        </div>
        <div class="flex flex-col gap-2 p-3">
          {@render bar('secondary', 'w-4/5')}
          {@render bar('secondary', 'w-2/3')}
        </div>
      </div>
    </div>
  {:else if slug === 'combobox'}
    <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
      <div class="flex flex-1 items-center gap-2 px-3 py-2.5">
        <div class="flex h-5 items-center gap-1 rounded-sm bg-gray-100 py-0.5 ps-2 pe-1">
          {@render bar('main', 'w-10')}
          {@render xIcon()}
        </div>
        <div class="flex h-5 items-center gap-1 rounded-sm bg-gray-100 py-0.5 ps-2 pe-1">
          {@render bar('main', 'w-6')}
          {@render xIcon()}
        </div>
      </div>
    </div>
  {:else if slug === 'context-menu'}
    <div class="flex max-w-56 flex-1 flex-col">
      <div class="min-h-20 flex-1 rounded-lg border border-dashed border-gray-200"></div>
      <div class="ms-24 -mt-6 flex w-fit flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
        {@render menuItems()}
      </div>
    </div>
  {:else if slug === 'dialog'}
    {@render modalPreview(dialogBody)}
  {:else if slug === 'drawer'}
    <div class="flex size-full flex-1 flex-col justify-end gap-2">
      <div class="min-h-20 flex-1 rounded-lg border border-dashed border-gray-200"></div>
      <div
        class="flex w-full max-w-none shrink-0 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60"
      >
        <div class="flex flex-col gap-2 px-3 pt-1 pb-4">
          <div class="flex justify-center py-2">
            <div class="h-1 w-12 rounded-full bg-gray-300"></div>
          </div>
          {@render bar('main', 'w-2/5')}
          {@render bar('secondary', 'w-4/5')}
        </div>
      </div>
    </div>
  {:else if slug === 'field'}
    <div class="flex max-w-56 flex-1 flex-col gap-3">
      {@render formField(true)}
    </div>
  {:else if slug === 'fieldset'}
    <div class="flex max-w-56 flex-1 flex-col gap-4">
      {@render formField(false, 'w-14', 'w-3/5')}
      {@render formField(false, 'w-20', 'w-2/5')}
    </div>
  {:else if slug === 'form'}
    <div class="flex max-w-56 flex-1 flex-col gap-4">
      {@render formField()}
      <div class="flex flex-col rounded-lg bg-gray-900">
        <div class="flex flex-1 items-center justify-center px-3 py-2.5">
          {@render bar('inverse', 'w-10')}
        </div>
      </div>
    </div>
  {:else if slug === 'input'}
    <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
      <div class="flex-1 px-3 py-2.5">
        {@render bar('main', 'w-3/5')}
      </div>
    </div>
  {:else if slug === 'menu'}
    <div class="flex max-w-56 flex-1 flex-col items-end gap-2">
      <div class="flex w-fit flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
        <div class="flex flex-1 items-center gap-2 p-2">
          {@render ellipsisIcon()}
        </div>
      </div>
      <div class="flex w-fit flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
        {@render menuItems()}
      </div>
    </div>
  {:else if slug === 'menubar'}
    <div class="flex w-fit flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
      <div class="flex flex-1 items-center gap-0.5 p-1">
        <div class="rounded-md px-3 py-2">{@render bar('secondary', 'w-8')}</div>
        <div class="rounded-md bg-gray-100 px-3 py-2">{@render bar('main', 'w-8')}</div>
        <div class="rounded-md px-3 py-2">{@render bar('secondary', 'w-8')}</div>
      </div>
    </div>
  {:else if slug === 'meter'}
    <div class="flex max-w-56 flex-1 flex-col gap-2">
      <div class="flex items-center justify-between">
        {@render bar('main', 'w-1/2')}
        {@render bar('main', 'w-8')}
      </div>
      {@render track('w-3/4')}
    </div>
  {:else if slug === 'navigation-menu'}
    <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
      <div class="flex flex-1 flex-col gap-3 p-3">
        <div class="flex items-center gap-4 border-b border-gray-100 pb-2">
          <div>{@render bar('main', 'w-10')}</div>
          <div>{@render bar('secondary', 'w-8')}</div>
          <div>{@render bar('secondary', 'w-6')}</div>
        </div>
        <div class="flex flex-col rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200/60">
          {@render bar('secondary', 'w-4/5')}
        </div>
      </div>
    </div>
  {:else if slug === 'popover'}
    <div class="flex max-w-56 flex-1 flex-col items-center gap-2">
      <div class="flex w-fit flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
        <div class="flex flex-1 items-center gap-2 px-3 py-2.5">
          {@render bar('main', 'w-12')}
        </div>
      </div>
      <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
        <div class="flex flex-1 flex-col gap-3 p-3">
          {@render bar('main', 'w-2/3')}
          <div class="flex flex-col gap-1.5">
            {@render bar('secondary', 'w-4/5')}
            {@render bar('secondary', 'w-3/5')}
          </div>
        </div>
      </div>
    </div>
  {:else if slug === 'preview-card'}
    <div class="flex max-w-36 flex-1 flex-col items-center gap-2">
      <div class="size-3 shrink-0 rounded-full bg-gray-300"></div>
      <div
        class="flex w-full max-w-36 flex-col gap-2 rounded-lg bg-gray-50 p-2 ring-1 ring-gray-200/60"
      >
        <div class="aspect-video w-full rounded-md bg-gray-200"></div>
        <div class="flex flex-col gap-2">
          {@render bar('main', 'w-2/3')}
          {@render bar('secondary', 'w-full')}
          {@render bar('secondary', 'w-3/5')}
        </div>
      </div>
    </div>
  {:else if slug === 'progress'}
    <div class="flex max-w-56 flex-1 flex-col gap-2">
      {@render track('w-1/2')}
    </div>
  {:else if slug === 'radio'}
    <div class="flex max-w-36 flex-1 flex-col gap-3">
      {@render radioItem(true, 'w-4/5')}
      {@render radioItem(false, 'w-3/5')}
      {@render radioItem(false, 'w-11/12')}
    </div>
  {:else if slug === 'scroll-area'}
    <div class="flex w-full max-w-36 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
      <div class="relative flex-1">
        <div class="flex flex-col gap-2 p-3">
          {@render bar('secondary', 'w-4/5')}
          {@render bar('secondary', 'w-11/12')}
          {@render bar('secondary', 'w-2/3')}
          {@render bar('secondary', 'w-5/6')}
          {@render bar('secondary', 'w-11/12')}
          {@render bar('secondary', 'w-4/5')}
        </div>
        <div class="absolute inset-e-1 top-2 h-8 w-1 rounded-full bg-gray-300"></div>
      </div>
    </div>
  {:else if slug === 'select'}
    <div class="flex max-w-56 flex-1 flex-col gap-2">
      <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
        <div class="flex flex-1 items-center justify-between gap-2 px-3 py-2.5">
          {@render bar('main', 'w-3/5')}
          {@render chevronDownIcon()}
        </div>
      </div>
      <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
        <div class="flex flex-1 flex-col gap-3 p-3">
          {@render bar('secondary', 'w-4/5')}
          {@render bar('main', 'w-3/5')}
          {@render bar('secondary', 'w-11/12')}
        </div>
      </div>
    </div>
  {:else if slug === 'separator'}
    <div class="flex w-full max-w-56 flex-col">
      <div class="flex flex-1 flex-col divide-y divide-gray-200">
        <div class="flex flex-col gap-2 py-4">
          {@render bar('main', 'w-3/5')}
          {@render bar('secondary', 'w-4/5')}
        </div>
        <div class="flex divide-x divide-gray-200 py-4">
          <div class="flex-1 pe-3">{@render bar('secondary', 'w-4/5')}</div>
          <div class="flex-1 px-3">{@render bar('secondary', 'w-3/5')}</div>
          <div class="flex-1 ps-3">{@render bar('secondary', 'w-full')}</div>
        </div>
      </div>
    </div>
  {:else if slug === 'slider'}
    <div class="flex w-full max-w-56 items-center">
      <div class="relative h-1 flex-1 rounded-full bg-gray-200">
        <div class="absolute inset-y-0 inset-s-0 w-1/2 rounded-full bg-gray-900">
          <div
            class="absolute -inset-e-2 top-1/2 size-4 -translate-y-1/2 rounded-full bg-gray-50 shadow-sm ring-1 ring-gray-200/60"
          ></div>
        </div>
      </div>
    </div>
  {:else if slug === 'switch'}
    <div
      class="inline-flex h-5 w-9 shrink-0 items-center justify-end rounded-md bg-gray-900 p-px [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[11px]"
    >
      <div
        class="aspect-square h-full rounded-[3px] bg-gray-50 [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[7px]"
      ></div>
    </div>
  {:else if slug === 'tabs'}
    <div class="flex max-w-56 flex-col gap-4">
      <div class="flex rounded-lg bg-gray-100 p-1">
        <div class="rounded-md px-3 py-2">{@render bar('secondary', 'w-6')}</div>
        <div class="flex flex-col rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-200/60">
          {@render bar('main', 'w-6')}
        </div>
        <div class="rounded-md px-3 py-2">{@render bar('secondary', 'w-6')}</div>
      </div>
      <div class="flex flex-col gap-2">
        {@render bar('main', 'w-2/3')}
        {@render bar('secondary')}
      </div>
    </div>
  {:else if slug === 'toast'}
    <div class="relative flex flex-1 justify-center">
      <div
        class="absolute inset-x-0 top-0 mx-auto flex h-11 w-full max-w-56 -translate-y-6 scale-80 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60"
      ></div>
      <div
        class="absolute inset-x-0 top-0 mx-auto flex h-11 w-full max-w-56 -translate-y-3 scale-90 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60"
      ></div>
      <div
        class="relative flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60"
      >
        <div class="flex flex-1 flex-col gap-2 p-3">
          {@render bar('main', 'w-3/5')}
          {@render bar('secondary', 'w-4/5')}
        </div>
      </div>
    </div>
  {:else if slug === 'toggle'}
    <div class="flex flex-1 flex-col items-center justify-center gap-2">
      <div class="flex w-full max-w-12 shrink-0 flex-col rounded-md bg-gray-100">
        <div class="flex-1 p-4">
          {@render bar('strong')}
        </div>
      </div>
      <div
        class="flex w-full max-w-12 shrink-0 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60"
      >
        <div class="flex-1 p-4">
          {@render bar()}
        </div>
      </div>
    </div>
  {:else if slug === 'toggle-group'}
    <div class="flex w-auto shrink-0 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
      <div class="flex">
        <div class="flex-1 bg-gray-100 p-4">
          {@render bar('strong', 'w-4')}
        </div>
        <div class="flex-1 p-4">
          {@render bar('main', 'w-4')}
        </div>
        <div class="flex-1 p-4">
          {@render bar('main', 'w-4')}
        </div>
      </div>
    </div>
  {:else if slug === 'toolbar'}
    <div class="flex items-center gap-1 rounded-lg p-1 ring-1 ring-gray-200/60">
      {#each [0, 1, 2] as i (i)}
        <div class="flex w-fit flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
          <div class="flex-1 p-4">
            {@render bar('main', 'w-4')}
          </div>
        </div>
      {/each}
    </div>
  {:else if slug === 'tooltip'}
    <div class="flex max-w-36 flex-1 flex-col items-center gap-2">
      <div class="flex w-full max-w-36 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
        <div class="flex-1 px-3 py-2.5">
          {@render bar('main', 'w-3/5')}
        </div>
      </div>
      <div class="size-3 shrink-0 rounded-full bg-gray-300"></div>
    </div>
  {:else}
    <div
      class="flex w-full max-w-56 flex-col gap-3 rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200/60"
    >
      {@render bar('main', 'w-2/5')}
      {@render bar('secondary', 'w-4/5')}
      {@render bar('secondary', 'w-3/5')}
    </div>
  {/if}
</div>

{#snippet bar(variant: 'main' | 'secondary' | 'strong' | 'inverse' = 'main', extraClass = '')}
  <div
    class="h-2 rounded-full {variant === 'main'
      ? 'bg-gray-300'
      : variant === 'secondary'
        ? 'bg-gray-200'
        : variant === 'strong'
          ? 'bg-gray-900'
          : 'bg-gray-50/40'} {extraClass}"
  ></div>
{/snippet}

{#snippet track(fillWidth: string)}
  <div class="h-1.5 w-full rounded-full bg-gray-200">
    <div class="h-1.5 {fillWidth} rounded-s-full bg-gray-900"></div>
  </div>
{/snippet}

{#snippet button(variant: 'primary' | 'secondary' = 'secondary')}
  <div class="h-3 w-7 rounded-sm {variant === 'primary' ? 'bg-gray-900' : 'bg-gray-200'}"></div>
{/snippet}

{#snippet modalPreview(body: Snippet)}
  <div
    class="flex w-full max-w-56 flex-col gap-5 rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200/60"
  >
    {@render body()}
    <div class="flex items-center justify-end gap-2 pt-1">
      {@render button('secondary')}
      {@render button('primary')}
    </div>
  </div>
{/snippet}

{#snippet alertDialogBody()}
  <div class="flex flex-col gap-3">
    {@render bar('main', 'w-1/2')}
    {@render bar('secondary', 'w-11/12')}
  </div>
{/snippet}

{#snippet dialogBody()}
  <div class="flex flex-col gap-3">
    {@render bar('main', 'w-3/5')}
    <div class="flex flex-col gap-2">
      {@render bar('secondary', 'w-full')}
      {@render bar('secondary', 'w-4/5')}
    </div>
  </div>
{/snippet}

{#snippet menuItems()}
  <div class="flex flex-1 flex-col gap-3 p-3">
    {@render bar('secondary', 'w-20')}
    {@render bar('secondary', 'w-14')}
    {@render bar('secondary', 'w-16')}
  </div>
{/snippet}

{#snippet checkboxItem(checked = false, barWidth = 'w-full', extraClass = '')}
  <div class="flex items-center gap-2 {extraClass}">
    <div class="size-4 shrink-0 rounded-sm {checked ? 'bg-gray-900' : 'bg-gray-100'}"></div>
    {@render bar('secondary', barWidth)}
  </div>
{/snippet}

{#snippet radioItem(checked = false, barWidth = 'w-full')}
  <div class="flex items-center gap-2">
    <div class="size-4 shrink-0 rounded-full {checked ? 'bg-gray-900' : 'bg-gray-100'}"></div>
    {@render bar('secondary', barWidth)}
  </div>
{/snippet}

{#snippet formField(showError = false, labelWidth = 'w-16', valueWidth = 'w-1/2')}
  <div class="flex flex-col gap-2">
    {@render bar('main', labelWidth)}
    <div class="flex w-full max-w-56 flex-col rounded-lg bg-gray-50 ring-1 ring-gray-200/60">
      <div class="flex flex-1 items-center px-3 py-2.5">
        {@render bar('secondary', valueWidth)}
      </div>
    </div>
    {#if showError}
      {@render bar('secondary', 'w-4/5')}
    {/if}
  </div>
{/snippet}

{#snippet chevronDownIcon(extraClass = '')}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="size-4 shrink-0 text-gray-400 {extraClass}"
    aria-hidden="true"
  >
    <path d="M5.75 9.5L12 15.75L18.25 9.5" />
  </svg>
{/snippet}

{#snippet xIcon()}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    class="size-4 shrink-0 text-gray-400"
    aria-hidden="true"
  >
    <path d="M6.25 6.25L17.75 17.75M17.75 6.25L6.25 17.75" />
  </svg>
{/snippet}

{#snippet ellipsisIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4 shrink-0 text-gray-400" aria-hidden="true">
    <path
      d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M20.25 13C20.8023 13 21.25 12.5523 21.25 12C21.25 11.4477 20.8023 11 20.25 11C19.6977 11 19.25 11.4477 19.25 12C19.25 12.5523 19.6977 13 20.25 13Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M3.75 13C4.30228 13 4.75 12.5523 4.75 12C4.75 11.4477 4.30228 11 3.75 11C3.19772 11 2.75 11.4477 2.75 12C2.75 12.5523 3.19772 13 3.75 13Z"
      fill="currentColor"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}
