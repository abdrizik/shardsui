<script lang="ts">
  import { Menu } from '$lib/components/menu'
  import Self from './menu-content-items.svelte'
  import type { ContentItem } from './menu-contents'

  let { items }: { items: ContentItem[] } = $props()
</script>

{#each items as item, index (index)}
  {#if item.type === 'item'}
    <Menu.Item
      data-testid={item.testId}
      disabled={item.disabled}
      closeOnClick={item.closeOnClick}
      onclick={item.onclick}>{item.label}</Menu.Item
    >
  {:else if item.type === 'submenu'}
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger data-testid={item.testId}>{item.label}</Menu.SubmenuTrigger>
      <Menu.Portal>
        <Menu.Positioner data-testid={item.menuTestId}>
          <Menu.Popup>
            <Self items={item.items} />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  {:else if item.type === 'radioGroup'}
    <Menu.RadioGroup value={item.value}>
      <Self items={item.items} />
    </Menu.RadioGroup>
  {:else}
    <Menu.RadioItem data-testid={item.testId} value={item.value} disabled={item.disabled}
      >{item.label}</Menu.RadioItem
    >
  {/if}
{/each}
