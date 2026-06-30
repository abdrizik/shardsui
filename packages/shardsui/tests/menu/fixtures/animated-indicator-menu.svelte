<script lang="ts">
  import { Menu } from '$lib/components/menu'

  let {
    checked = $bindable(true),
    value = $bindable('a'),
    keepMounted = true,
    onAnimationEnd
  }: {
    checked?: boolean
    value?: string | null
    keepMounted?: boolean
    onAnimationEnd: () => void
  } = $props()
</script>

<div>
  <button
    onclick={() => {
      checked = false
      value = 'b'
    }}>Close</button
  >
  <Menu.Root bind:open={() => true, () => {}} modal={false}>
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.CheckboxItem bind:checked>
            <Menu.CheckboxItemIndicator
              class="animation-test-indicator"
              data-testid="checkbox-indicator"
              {keepMounted}
              onanimationend={onAnimationEnd}
            />
          </Menu.CheckboxItem>
          <Menu.RadioGroup bind:value>
            <Menu.RadioItem value="a">
              <Menu.RadioItemIndicator
                class="animation-test-indicator"
                data-testid="radio-indicator"
                {keepMounted}
                onanimationend={onAnimationEnd}
              />
            </Menu.RadioItem>
            <Menu.RadioItem value="b">Other</Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</div>

<style>
  @keyframes test-anim {
    to {
      opacity: 0;
    }
  }

  :global(.animation-test-indicator[data-ending-style]) {
    animation: test-anim 1ms;
  }
</style>
