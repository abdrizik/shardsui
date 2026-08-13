<script lang="ts">
  import { tick } from 'svelte'
  import { Autocomplete } from '@shardsui/svelte/autocomplete'

  const COLUMNS = 5

  type EmojiItem = {
    emoji: string
    name: string
  }

  type EmojiGroup = {
    label: string
    items: EmojiItem[]
  }

  function chunk<T>(array: T[], size: number): T[][] {
    const rows: T[][] = []
    for (let i = 0; i < array.length; i += size) rows.push(array.slice(i, i + size))
    return rows
  }

  const emojiGroups: EmojiGroup[] = [
    {
      label: 'Smileys & Emotion',
      items: [
        { emoji: '😀', name: 'grinning face' },
        { emoji: '😃', name: 'grinning face with big eyes' },
        { emoji: '😄', name: 'grinning face with smiling eyes' },
        { emoji: '😁', name: 'beaming face with smiling eyes' },
        { emoji: '😆', name: 'grinning squinting face' },
        { emoji: '😅', name: 'grinning face with sweat' },
        { emoji: '🤣', name: 'rolling on the floor laughing' },
        { emoji: '😂', name: 'face with tears of joy' },
        { emoji: '🙂', name: 'slightly smiling face' },
        { emoji: '🙃', name: 'upside-down face' },
        { emoji: '😉', name: 'winking face' },
        { emoji: '😊', name: 'smiling face with smiling eyes' },
        { emoji: '😇', name: 'smiling face with halo' },
        { emoji: '🥰', name: 'smiling face with hearts' },
        { emoji: '😍', name: 'smiling face with heart-eyes' },
        { emoji: '🤩', name: 'star-struck' },
        { emoji: '😘', name: 'face blowing a kiss' },
        { emoji: '😗', name: 'kissing face' },
        { emoji: '☺️', name: 'smiling face' },
        { emoji: '😚', name: 'kissing face with closed eyes' },
        { emoji: '😙', name: 'kissing face with smiling eyes' },
        { emoji: '🥲', name: 'smiling face with tear' },
        { emoji: '😋', name: 'face savoring food' },
        { emoji: '😛', name: 'face with tongue' },
        { emoji: '😜', name: 'winking face with tongue' },
        { emoji: '🤪', name: 'zany face' },
        { emoji: '😝', name: 'squinting face with tongue' },
        { emoji: '🤑', name: 'money-mouth face' },
        { emoji: '🤗', name: 'hugging face' },
        { emoji: '🤭', name: 'face with hand over mouth' }
      ]
    },
    {
      label: 'Animals & Nature',
      items: [
        { emoji: '🐶', name: 'dog face' },
        { emoji: '🐱', name: 'cat face' },
        { emoji: '🐭', name: 'mouse face' },
        { emoji: '🐹', name: 'hamster' },
        { emoji: '🐰', name: 'rabbit face' },
        { emoji: '🦊', name: 'fox' },
        { emoji: '🐻', name: 'bear' },
        { emoji: '🐼', name: 'panda' },
        { emoji: '🐨', name: 'koala' },
        { emoji: '🐯', name: 'tiger face' },
        { emoji: '🦁', name: 'lion' },
        { emoji: '🐮', name: 'cow face' },
        { emoji: '🐷', name: 'pig face' },
        { emoji: '🐽', name: 'pig nose' },
        { emoji: '🐸', name: 'frog' },
        { emoji: '🐵', name: 'monkey face' },
        { emoji: '🙈', name: 'see-no-evil monkey' },
        { emoji: '🙉', name: 'hear-no-evil monkey' },
        { emoji: '🙊', name: 'speak-no-evil monkey' },
        { emoji: '🐒', name: 'monkey' },
        { emoji: '🐔', name: 'chicken' },
        { emoji: '🐧', name: 'penguin' },
        { emoji: '🐦', name: 'bird' },
        { emoji: '🐤', name: 'baby chick' },
        { emoji: '🐣', name: 'hatching chick' },
        { emoji: '🐥', name: 'front-facing baby chick' },
        { emoji: '🦆', name: 'duck' },
        { emoji: '🦅', name: 'eagle' },
        { emoji: '🦉', name: 'owl' },
        { emoji: '🦇', name: 'bat' }
      ]
    },
    {
      label: 'Food & Drink',
      items: [
        { emoji: '🍎', name: 'red apple' },
        { emoji: '🍏', name: 'green apple' },
        { emoji: '🍊', name: 'tangerine' },
        { emoji: '🍋', name: 'lemon' },
        { emoji: '🍌', name: 'banana' },
        { emoji: '🍉', name: 'watermelon' },
        { emoji: '🍇', name: 'grapes' },
        { emoji: '🍓', name: 'strawberry' },
        { emoji: '🫐', name: 'blueberries' },
        { emoji: '🍈', name: 'melon' },
        { emoji: '🍒', name: 'cherries' },
        { emoji: '🍑', name: 'peach' },
        { emoji: '🥭', name: 'mango' },
        { emoji: '🍍', name: 'pineapple' },
        { emoji: '🥥', name: 'coconut' },
        { emoji: '🥝', name: 'kiwi fruit' },
        { emoji: '🍅', name: 'tomato' },
        { emoji: '🍆', name: 'eggplant' },
        { emoji: '🥑', name: 'avocado' },
        { emoji: '🥦', name: 'broccoli' },
        { emoji: '🥬', name: 'leafy greens' },
        { emoji: '🥒', name: 'cucumber' },
        { emoji: '🌶️', name: 'hot pepper' },
        { emoji: '🫑', name: 'bell pepper' },
        { emoji: '🌽', name: 'ear of corn' },
        { emoji: '🥕', name: 'carrot' },
        { emoji: '🫒', name: 'olive' },
        { emoji: '🧄', name: 'garlic' },
        { emoji: '🧅', name: 'onion' },
        { emoji: '🥔', name: 'potato' }
      ]
    }
  ]

  let textValue = $state('')
  let searchValue = $state('')
  let textInputEl = $state<HTMLInputElement | null>(null)

  async function insertEmoji(emoji: string) {
    if (!textInputEl) return
    const start = textInputEl.selectionStart ?? textValue.length
    const end = textInputEl.selectionEnd ?? textValue.length
    const caret = start + emoji.length
    textValue = textValue.slice(0, start) + emoji + textValue.slice(end)
    await tick()
    textInputEl?.focus()
    textInputEl?.setSelectionRange(caret, caret)
  }
</script>

<div class="mx-auto w-64">
  <div class="flex items-center gap-2">
    <input
      bind:this={textInputEl}
      bind:value={textValue}
      type="text"
      class="h-8 flex-1 rounded-md border border-gray-200 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
      placeholder="Reply to the discussion"
    />

    <Autocomplete.Root
      items={emojiGroups}
      itemToStringValue={(item: EmojiItem) => item.name}
      bind:value={() => searchValue, () => {}}
      grid
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) searchValue = ''
      }}
    >
      <Autocomplete.Trigger
        class="size-8 rounded-md border border-gray-200 bg-gray-50 text-xl text-gray-900 outline-hidden hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 data-popup-open:bg-gray-100"
        aria-label="Choose emoji"
      >
        😀
      </Autocomplete.Trigger>

      <Autocomplete.Portal>
        <Autocomplete.Positioner class="outline-hidden" sideOffset={4} align="end">
          <Autocomplete.Popup
            aria-label="Select emoji"
            class="max-h-82 max-w-(--available-width) origin-(--transform-origin) rounded-lg bg-gray-50 text-gray-900 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] [--input-container-height:3rem] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
          >
            <div
              class="mx-1 flex h-(--input-container-height) w-64 items-center justify-center bg-gray-50 text-center"
            >
              <Autocomplete.Input
                oninput={(event) => (searchValue = event.currentTarget.value)}
                placeholder="Search emojis…"
                class="h-8 w-64 max-w-full rounded-md border border-gray-200 px-2 text-sm font-normal text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-gray-950 any-pointer-coarse:text-base"
              />
            </div>
            <Autocomplete.Empty>
              <div class="px-2 py-3 text-sm/4 text-gray-600">No emojis found</div>
            </Autocomplete.Empty>
            <Autocomplete.List
              class="max-h-[min(calc(20.5rem-var(--input-container-height)),calc(var(--available-height)-var(--input-container-height)))] scroll-pt-10 scroll-pb-1.5 overflow-auto overscroll-contain"
            >
              <Autocomplete.Collection>
                {#snippet children(group: EmojiGroup)}
                  <Autocomplete.Group class="block">
                    <Autocomplete.GroupLabel
                      class="sticky top-0 z-1 m-0 w-full border-b border-gray-100 bg-gray-50 px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-gray-600 uppercase"
                    >
                      {group.label}
                    </Autocomplete.GroupLabel>
                    <div class="p-1" role="presentation">
                      {#each chunk(group.items, COLUMNS) as row, rowIdx (`${group.label}-${rowIdx}`)}
                        <Autocomplete.Row class="grid grid-cols-5">
                          {#each row as item (item.name)}
                            <Autocomplete.Item
                              value={item}
                              onclick={() => insertEmoji(item.emoji)}
                              class="flex h-10 min-w-(--anchor-width) flex-col items-center justify-center rounded-md bg-transparent px-0.5 py-2 text-gray-900 outline-hidden select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-md data-highlighted:before:bg-gray-200"
                            >
                              <span class="text-2xl leading-none">{item.emoji}</span>
                            </Autocomplete.Item>
                          {/each}
                        </Autocomplete.Row>
                      {/each}
                    </div>
                  </Autocomplete.Group>
                {/snippet}
              </Autocomplete.Collection>
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  </div>
</div>
