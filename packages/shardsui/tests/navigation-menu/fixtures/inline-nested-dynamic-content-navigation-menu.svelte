<script lang="ts">
  import { untrack } from 'svelte'
  import { NavigationMenu } from '$lib/components/navigation-menu'

  let { initialContentStage = 0 }: { initialContentStage?: number } = $props()

  let contentStage = $state(untrack(() => initialContentStage))
  let nestedValue = $state<string | null>('nested-item-1')

  function insertContent() {
    contentStage = Math.min(contentStage + 1, 2)
  }
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="item-1">
      <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>

      <NavigationMenu.Content>
        <div data-testid="popup-1">
          <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
          <NavigationMenu.Root bind:value={nestedValue}>
            <NavigationMenu.List>
              <NavigationMenu.Item value="nested-item-1">
                <NavigationMenu.Trigger data-testid="nested-trigger-1">
                  Nested Item 1
                </NavigationMenu.Trigger>
                <NavigationMenu.Content>
                  <div data-testid="nested-popup-1">
                    <button type="button" data-testid="insert-content" onclick={insertContent}>
                      Insert content
                    </button>
                    {#if contentStage >= 1}
                      <div data-testid="extra-content">
                        <NavigationMenu.Link href="#nested-link-1"
                          >Nested Link 1</NavigationMenu.Link
                        >
                        <NavigationMenu.Link href="#nested-link-2"
                          >Nested Link 2</NavigationMenu.Link
                        >
                        <NavigationMenu.Link href="#nested-link-3"
                          >Nested Link 3</NavigationMenu.Link
                        >
                      </div>
                    {/if}
                    {#if contentStage >= 2}
                      <div data-testid="extra-content-2">
                        <NavigationMenu.Link href="#nested-link-4"
                          >Nested Link 4</NavigationMenu.Link
                        >
                        <NavigationMenu.Link href="#nested-link-5"
                          >Nested Link 5</NavigationMenu.Link
                        >
                      </div>
                    {/if}
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            </NavigationMenu.List>

            <NavigationMenu.Viewport />
          </NavigationMenu.Root>
        </div>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner data-testid="positioner">
      <NavigationMenu.Popup data-testid="popup-root">
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
