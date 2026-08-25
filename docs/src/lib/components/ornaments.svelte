<script lang="ts">
  const ornaments = [
    'square',
    'circle',
    'triangle',
    'square',
    'circle',
    'triangle',
    'square',
    'circle',
    'triangle',
    'square'
  ] as const
</script>

<div aria-hidden="true" class="shapes">
  {#each ornaments as ornament, i (i)}
    {#if ornament === 'square'}
      <svg viewBox="11.9 2.7 9.2 9.2" fill="currentColor" class="shape" style:--i={i}>
        <path
          d="M15.4278 3.03394C14.4945 2.78414 13.5354 3.3379 13.2851 4.27103L12.2008 8.3132C11.9503 9.24706 12.5046 10.2071 13.4386 10.4571L17.4871 11.5407C18.4203 11.7905 19.3795 11.2367 19.6298 10.3036L20.7141 6.26142C20.9646 5.32756 20.4103 4.36752 19.4763 4.11753L15.4278 3.03394Z"
        />
      </svg>
    {:else if ornament === 'triangle'}
      <svg viewBox="2.7 5.9 8.9 9.2" fill="currentColor" class="shape" style:--i={i}>
        <path
          d="M5.47325 6.41118C5.26797 6.23912 4.98651 6.18959 4.73483 6.28125C4.48315 6.3729 4.29945 6.59182 4.25289 6.8556L3.01144 13.8885C2.96486 14.1523 3.06257 14.421 3.26777 14.5933C3.47297 14.7655 3.75448 14.8153 4.00628 14.7237L10.7244 12.2812C10.9763 12.1896 11.1602 11.9705 11.2067 11.7065C11.2533 11.4425 11.1553 11.1738 10.9499 11.0016L5.47325 6.41118Z"
        />
      </svg>
    {:else}
      <svg viewBox="10 13.15 8 8" fill="currentColor" class="shape" style:--i={i}>
        <path
          d="M14.0098 13.3154C11.8866 13.3154 10.1641 15.0349 10.1641 17.1577C10.1641 19.2806 11.8866 21 14.0098 21C16.1329 21 17.8555 19.2806 17.8555 17.1577C17.8555 15.0349 16.1329 13.3154 14.0098 13.3154Z"
        />
      </svg>
    {/if}
  {/each}
</div>

<style>
  .shapes {
    pointer-events: none;
    position: fixed;
    inset-inline: 0;
    inset-block-end: 0;
    display: none;
    block-size: calc(var(--spacing) * 52);
    overflow: hidden;
  }

  .shape {
    position: absolute;
    inline-size: calc(var(--spacing) * 12);
    block-size: calc(var(--spacing) * 12);
    inset-inline-start: calc(3% + var(--i) * 10%);
  }

  .shape:nth-child(odd) {
    inset-block-end: calc(var(--spacing) * 2);
    color: var(--color-gray-200);
  }

  .shape:nth-child(even) {
    inset-block-end: calc(var(--spacing) * 16);
    color: var(--color-gray-100);
  }

  @media (width >= 48rem) {
    .shapes {
      display: block;
    }
  }
</style>
