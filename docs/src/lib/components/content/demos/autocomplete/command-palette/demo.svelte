<script lang="ts">
  import { Autocomplete } from '@shardsui/svelte/autocomplete'
  import { Dialog } from '@shardsui/svelte/dialog'
  import { ScrollArea } from '@shardsui/svelte/scroll-area'

  type Group = {
    value: string
    kind: string
    items: string[]
  }

  const groups: Group[] = [
    {
      value: 'Pages',
      kind: 'Page',
      items: ['Kerning & Tracking', 'Contrast Ratio', 'Flexbox & Grid', 'Design Tokens']
    },
    {
      value: 'Actions',
      kind: 'Action',
      items: ['Open settings', 'View activity', 'Create file', 'View profile']
    }
  ]

  let open = $state(false)

  function onkeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      open = true
    }
  }
</script>

<svelte:window {onkeydown} />

<Dialog.Root bind:open>
  <Dialog.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    Open command palette
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop
      class="fixed inset-0 bg-black opacity-20 transition-opacity duration-150 ease-[cubic-bezier(0.45,1.005,0,1.005)] data-ending-style:opacity-0 data-starting-style:opacity-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Dialog.Viewport
      class="fixed inset-0 flex items-start justify-center overflow-hidden px-2 pt-18 pb-2"
    >
      <Dialog.Popup
        aria-label="Command palette"
        class="relative flex max-h-[min(36rem,calc(100dvh-5rem))] w-[calc(100vw-1rem)] max-w-md flex-col overflow-hidden rounded-2xl bg-gray-50 text-gray-900 shadow-2xl outline-1 outline-black/4 transition-[opacity,transform,scale,translate] duration-150 data-ending-style:-translate-y-4 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:-translate-y-4 data-starting-style:scale-95 data-starting-style:opacity-0"
      >
        <Autocomplete.Root open items={groups} inline autoHighlight="always" keepHighlight>
          <Autocomplete.Input
            aria-label="Search commands"
            class="w-full border-0 border-b border-gray-100 bg-transparent p-4 text-sm font-normal tracking-wide text-gray-900 outline-hidden placeholder:text-gray-500 any-pointer-coarse:text-base"
            placeholder="Search pages and actions…"
          />
          <Dialog.Close class="sr-only">Close command palette</Dialog.Close>

          <ScrollArea.Root
            class="relative flex max-h-[min(60dvh,24rem)] min-h-0 flex-[0_1_auto] overflow-hidden"
          >
            <ScrollArea.Viewport
              class="min-h-0 flex-1 scroll-py-1 overscroll-contain focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-gray-950"
            >
              <ScrollArea.Content style="min-width:100%">
                <Autocomplete.Empty>
                  <div
                    class="flex min-h-32 items-center justify-center py-4 pr-4 pl-2 text-sm/4 text-gray-600"
                  >
                    No results found.
                  </div>
                </Autocomplete.Empty>

                <Autocomplete.List class="p-2">
                  <Autocomplete.Collection>
                    {#snippet children(group: Group)}
                      <Autocomplete.Group items={group.items} class="block not-last:mb-1">
                        <Autocomplete.GroupLabel
                          class="m-0 flex h-8 items-center px-3 text-sm leading-none font-normal tracking-normal text-gray-600 outline-hidden select-none"
                        >
                          {group.value}
                        </Autocomplete.GroupLabel>
                        <Autocomplete.Collection>
                          {#snippet children(command: string)}
                            <Autocomplete.Item
                              value={command}
                              onclick={() => (open = false)}
                              class="group grid min-h-8 scroll-my-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md pr-3 pl-9 text-sm/4.5 font-normal tracking-wide outline-hidden select-none data-highlighted:bg-gray-100"
                            >
                              <span class="truncate font-normal">{command}</span>
                              <span
                                class="shrink-0 text-sm tracking-normal whitespace-nowrap text-gray-500 group-data-highlighted:text-gray-700"
                              >
                                {group.kind}
                              </span>
                            </Autocomplete.Item>
                          {/snippet}
                        </Autocomplete.Collection>
                      </Autocomplete.Group>
                    {/snippet}
                  </Autocomplete.Collection>
                </Autocomplete.List>
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar class="-mr-1 flex w-6 justify-center py-2">
              <ScrollArea.Thumb
                class="flex w-full justify-center before:block before:h-full before:w-1 before:rounded-sm before:bg-gray-400 before:content-['']"
              />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          <div
            class="flex items-center justify-between border-t border-gray-200 bg-gray-100 px-3 py-2.5 text-xs text-gray-600"
          >
            <div class="flex items-center gap-2">
              <span>Run</span>
              <kbd
                class="inline-flex h-5 min-w-5 items-center justify-center rounded border border-gray-300 bg-gray-100 px-1 text-xs font-normal text-gray-700"
              >
                Enter
              </kbd>
            </div>
            <div class="flex items-center gap-2">
              <span>Open palette</span>
              <kbd
                class="inline-flex h-5 min-w-5 items-center justify-center rounded border border-gray-300 bg-gray-100 px-1 text-xs font-normal text-gray-700"
              >
                Cmd
              </kbd>
              <kbd
                class="inline-flex h-5 min-w-5 items-center justify-center rounded border border-gray-300 bg-gray-100 px-1 text-xs font-normal text-gray-700"
              >
                K
              </kbd>
            </div>
          </div>
        </Autocomplete.Root>
      </Dialog.Popup>
    </Dialog.Viewport>
  </Dialog.Portal>
</Dialog.Root>
