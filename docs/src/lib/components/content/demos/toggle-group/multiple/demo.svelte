<script lang="ts">
  import { Toggle } from '@shardsui/svelte/toggle'
  import { ToggleGroup } from '@shardsui/svelte/toggle-group'

  const formats = [
    { value: 'bold', label: 'Bold', icon: boldIcon },
    { value: 'italic', label: 'Italic', icon: italicIcon },
    { value: 'underline', label: 'Underline', icon: underlineIcon }
  ]
</script>

<ToggleGroup
  multiple
  value={['bold', 'underline']}
  aria-label="Text formatting"
  class="flex gap-px"
>
  {#each formats as format (format.value)}
    <Toggle
      value={format.value}
      aria-label={format.label}
      class="flex size-8 items-center justify-center rounded-md text-gray-600 select-none hover:bg-gray-100 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:not-data-pressed:bg-gray-100 data-pressed:bg-gray-200 data-pressed:text-gray-900"
    >
      {@render format.icon()}
    </Toggle>
  {/each}
</ToggleGroup>

{#snippet boldIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
    <path
      d="M17.252 8V7.75C17.252 5.54086 15.4611 3.75 13.252 3.75H8.74219C7.08533 3.75 5.74219 5.09315 5.74219 6.75V9C5.74219 10.6569 7.08533 12 8.74219 12H13.252C15.4611 12 17.252 10.2091 17.252 8Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="square"
      stroke-linejoin="round"
    />
    <path
      d="M5.74219 12V17.25C5.74219 18.9069 7.08533 20.25 8.74219 20.25H12.502"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="square"
      stroke-linejoin="round"
    />
    <path
      d="M13 20.25H14.25C16.4591 20.25 18.25 18.4591 18.25 16.25V16C18.25 13.7909 16.4591 12 14.25 12H13"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="square"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet italicIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
    <path
      d="M9.75 3.75L14.5 3.75L19.25 3.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M14.5 3.75L9.5 20.25"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M4.75 20.25H9.5L14.2601 20.25"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
{/snippet}

{#snippet underlineIcon()}
  <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
    <path d="M5.75 20.75H18.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    <path
      d="M5.75 3.75V12C5.75 15.4518 8.54822 18.25 12 18.25C15.4518 18.25 18.25 15.4518 18.25 12V3.75"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
{/snippet}
