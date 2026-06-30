<script lang="ts">
  import { Drawer } from '$lib/components/drawer'
  import { Slider } from '$lib/components/slider'

  let { variant = 'native' }: { variant?: 'native' | 'slider' } = $props()
</script>

<Drawer.Root open swipeDirection="down">
  <Drawer.Portal>
    <Drawer.Backdrop data-testid="backdrop" />
    <Drawer.Viewport>
      <Drawer.Popup>
        {#if variant === 'native'}
          <input type="range" data-testid="range" />
        {:else}
          <Slider.Root value={50}>
            <Slider.Control>
              <Slider.Track>
                <Slider.Indicator />
                <Slider.Thumb />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
        {/if}
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
