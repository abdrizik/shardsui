<script lang="ts">
  import { gsap } from 'gsap'
  import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
  import type { Attachment } from 'svelte/attachments'

  gsap.registerPlugin(MorphSVGPlugin)

  const marks = [
    'M15.4278 3.03394C14.4945 2.78414 13.5354 3.3379 13.2851 4.27103L12.2008 8.3132C11.9503 9.24706 12.5046 10.2071 13.4386 10.4571L17.4871 11.5407C18.4203 11.7905 19.3795 11.2367 19.6298 10.3036L20.7141 6.26142C20.9646 5.32756 20.4103 4.36752 19.4763 4.11753L15.4278 3.03394Z',
    'M5.47325 6.41118C5.26797 6.23912 4.98651 6.18959 4.73483 6.28125C4.48315 6.3729 4.29945 6.59182 4.25289 6.8556L3.01144 13.8885C2.96486 14.1523 3.06257 14.421 3.26777 14.5933C3.47297 14.7655 3.75448 14.8153 4.00628 14.7237L10.7244 12.2812C10.9763 12.1896 11.1602 11.9705 11.2067 11.7065C11.2533 11.4425 11.1553 11.1738 10.9499 11.0016L5.47325 6.41118Z',
    'M14.0098 13.3154C11.8866 13.3154 10.1641 15.0349 10.1641 17.1577C10.1641 19.2806 11.8866 21 14.0098 21C16.1329 21 17.8555 19.2806 17.8555 17.1577C17.8555 15.0349 16.1329 13.3154 14.0098 13.3154Z'
  ]

  const squircle =
    'M21 4.8056C21 3.2537 19.7384 2 18.1875 2C17.6328 2 17.0577 2.1173 16.5734 2.2162C16.4779 2.2357 16.3859 2.2544 16.2983 2.2714C15.7158 2.3845 15.2665 2.437 14.872 2.3521C13.9376 2.1508 12.9312 2 12 2C11.0688 2 10.0624 2.1508 9.1279 2.3521C8.7335 2.437 8.2842 2.3845 7.7017 2.2714C7.6141 2.2544 7.5221 2.2357 7.4266 2.2162C6.9423 2.1173 6.3672 2 5.8125 2C4.2616 2 3 3.2537 3 4.8056C3 5.4023 3.1424 6.0157 3.2611 6.5273C3.2816 6.6157 3.3014 6.7011 3.3196 6.7828C3.4556 7.3915 3.5235 7.8557 3.4397 8.2644C3.1941 9.4627 3 10.788 3 12C3 13.212 3.1941 14.5373 3.4397 15.7356C3.5235 16.1443 3.4556 16.6085 3.3196 17.2172C3.3014 17.2989 3.2816 17.3843 3.2611 17.4727C3.1424 17.9843 3 18.5978 3 19.1945C3 20.7463 4.2616 22 5.8125 22C6.3672 22 6.9423 21.8827 7.4266 21.7839C7.5221 21.7644 7.6141 21.7456 7.7017 21.7286C8.2842 21.6155 8.7335 21.563 9.128 21.648C10.0625 21.8492 11.0688 22 12 22C12.9312 22 13.9376 21.8492 14.872 21.6479C15.2665 21.563 15.7158 21.6155 16.2983 21.7286C16.3859 21.7456 16.4779 21.7644 16.5734 21.7838C17.0577 21.8827 17.6328 22 18.1875 22C19.7384 22 21 20.7463 21 19.1944C21 18.5954 20.8562 17.9796 20.7363 17.4664C20.7156 17.3779 20.6957 17.2925 20.6773 17.2107C20.54 16.6001 20.4714 16.135 20.5556 15.7254C20.8032 14.5217 21 13.1948 21 12C21 10.8052 20.8032 9.4783 20.5556 8.2746C20.4714 7.865 20.54 7.3999 20.6773 6.7893C20.6957 6.7075 20.7156 6.6221 20.7363 6.5337C20.8561 6.0204 21 5.4046 21 4.8056Z'

  // hover lives on the stable wrapper (never transforms) so the mark can't flicker;
  // listeners are added programmatically to avoid a static-element a11y warning
  const morph: Attachment<HTMLElement> = (host) => {
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.7
    const timeline = gsap
      .timeline({ paused: true, defaults: { duration, ease: 'expo.inOut' } })
      .to(
        [...host.querySelectorAll('path')],
        // rotational interpolation keeps the smooth anchors from kinking mid-morph
        { morphSVG: { shape: squircle, type: 'rotational' } },
        0
      )
      .to(host.querySelector('svg'), { rotation: 180, transformOrigin: '50% 50%' }, 0)

    const play = () => timeline.play()
    const reverse = () => timeline.reverse()
    host.addEventListener('pointerenter', play)
    host.addEventListener('pointerleave', reverse)

    return () => {
      host.removeEventListener('pointerenter', play)
      host.removeEventListener('pointerleave', reverse)
      timeline.kill()
    }
  }
</script>

<span class="mark" {@attach morph}>
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {#each marks as d (d)}
      <path {d} />
    {/each}
  </svg>
</span>

<style>
  .mark {
    display: inline-flex;
    /* fixed box, so the hit area never depends on the animating child */
    inline-size: calc(var(--spacing) * 8);
    block-size: calc(var(--spacing) * 8);
  }

  .mark svg {
    /* the rotating svg overflows the wrapper mid-spin; hit-testing it would move the
       hover region with the animation and flicker between enter and leave */
    pointer-events: none;
  }
</style>
