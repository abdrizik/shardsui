<script lang="ts">
  import { Accordion } from '@shardsui/svelte/accordion'

  const faqs = [
    {
      q: 'What is ShardsUI?',
      a: 'Unstyled Svelte 5 components with keyboard interaction, focus management, and ARIA. You compose the parts and bring the CSS.'
    },
    {
      q: 'Can I use ShardsUI without Svelte?',
      a: 'No. ShardsUI is a Svelte 5 library and relies on Svelte runes and its rendering model.'
    },
    {
      q: 'Is ShardsUI free for commercial use?',
      a: 'Yes. ShardsUI is MIT-licensed and free to use in commercial projects.'
    }
  ]
</script>

<section>
  <header>
    <h2>faq</h2>
  </header>
  <Accordion.Root class="faq-root" multiple>
    {#each faqs as faq (faq.q)}
      <Accordion.Item class="faq-item">
        <Accordion.Header>
          <Accordion.Trigger class="faq-trigger">
            {faq.q}
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3.75V12M12 12V20.25M12 12H3.75M12 12H20.25"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel class="faq-panel">
          <p>{faq.a}</p>
        </Accordion.Panel>
      </Accordion.Item>
    {/each}
  </Accordion.Root>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 3);
    margin-block-start: calc(var(--spacing) * 12);
    padding-block-start: calc(var(--spacing) * 8);
    border-block-start: var(--border-hairline) solid var(--color-border);
  }

  section h2 {
    font-size: var(--text-code);
    font-weight: var(--font-weight-medium);
    color: var(--color-gray-900);
  }

  section svg {
    flex-shrink: 0;
    inline-size: calc(var(--spacing) * 4);
    block-size: calc(var(--spacing) * 4);
    transition: transform 200ms var(--ease-out);
  }

  section p {
    padding-block-end: calc(var(--spacing) * 3);
  }

  section :global {
    .faq-root {
      inline-size: 100%;
      max-inline-size: 32rem;
      color: var(--color-gray-900);
    }

    .faq-item {
      border-block-end: var(--border-hairline) solid var(--color-gray-100);
    }

    .faq-item:last-child {
      border-block-end: none;
    }

    .faq-trigger {
      display: flex;
      inline-size: 100%;
      align-items: center;
      justify-content: space-between;
      gap: calc(var(--spacing) * 4);
      padding-block: calc(var(--spacing) * 3);
      text-align: start;
      font-size: var(--text-code);
      font-weight: var(--font-weight-medium);
    }

    .faq-trigger:focus-visible {
      outline: 2px solid var(--color-gray-900);
    }

    .faq-trigger[data-panel-open] svg {
      transform: rotate(45deg);
    }

    .faq-panel {
      height: var(--accordion-panel-height);
      overflow: hidden;
      font-size: var(--text-sm);
      line-height: 1.5;
      text-wrap: pretty;
      color: var(--color-gray-600);
      transition: height 150ms var(--ease-out);
    }

    .faq-panel[data-starting-style],
    .faq-panel[data-ending-style] {
      height: 0;
    }
  }

  @media (width >= 40rem) {
    section {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: calc(var(--spacing) * 8);
    }

    header {
      padding-block-start: calc(var(--spacing) * 3);
    }
  }
</style>
