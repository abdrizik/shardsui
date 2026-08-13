<script lang="ts">
  import { Toggle } from '@shardsui/svelte/toggle'
</script>

<Toggle
  aria-label="Bookmark"
  class="flex size-9 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-600 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-200 data-pressed:text-gray-900"
>
  {#snippet children({ pressed })}
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-5">
      <path
        d="M19.25 20.2515V5.75C19.25 4.09315 17.9069 2.75 16.25 2.75H7.75C6.09315 2.75 4.75 4.09315 4.75 5.75V20.2515C4.75 21.0522 5.64414 21.5281 6.30839 21.081L10.3248 18.3776C11.3376 17.6959 12.6624 17.6959 13.6752 18.3776L17.6916 21.081C18.3559 21.5282 19.25 21.0522 19.25 20.2515Z"
        fill={pressed ? 'currentColor' : 'none'}
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  {/snippet}
</Toggle>
