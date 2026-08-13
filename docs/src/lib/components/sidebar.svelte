<script lang="ts">
  import { resolve } from '$app/paths'
  import Logo from '$lib/components/logo.svelte'
  import GitHub from '$lib/components/icons/github.svelte'
  import Npm from '$lib/components/icons/npm.svelte'
  import { github, installCommand, npm, version } from '$lib/data/site'
  import { createClipboard } from '$lib/utils/clipboard.svelte'

  const clipboard = createClipboard()
</script>

<aside>
  <div>
    <h1>
      <Logo />
      <span>
        <span>ShardsUI.</span> Unstyled, accessible UI components for
        {@render svelteLockup()}
        <span class="sr-only">Svelte</span>
      </span>
    </h1>
    <p>
      Keyboard interaction, focus management, and ARIA on every part. You compose them and bring the
      CSS. Inspired by
      <a href="https://base-ui.com" rel="external noopener noreferrer">Base&nbsp;UI</a>.
    </p>
    <div>
      <button
        type="button"
        data-copied={clipboard.copied ? '' : undefined}
        onclick={() => clipboard.copy(installCommand)}
      >
        <span>{installCommand}</span>
        <span class="sr-only" role="status">{clipboard.copied ? 'Copied' : ''}</span>
        <span>
          <span aria-hidden="true">
            <svg viewBox="0 0 14 14" fill="currentcolor">
              <path
                d="M1.5 1C0.675781 1 0 1.67578 0 2.5V10.5C0 11.3242 0.675781 12 1.5 12H3V12.5C3 13.3242 3.67578 14 4.5 14H12.5C13.3242 14 14 13.3242 14 12.5V4.5C14 3.67578 13.3242 3 12.5 3H11V2.5C11 1.67578 10.3242 1 9.5 1H1.5ZM1.5 2H9.5C9.78125 2 10 2.21875 10 2.5V10.5C10 10.7812 9.78125 11 9.5 11H1.5C1.21875 11 1 10.7812 1 10.5V2.5C1 2.21875 1.21875 2 1.5 2ZM11 4H12.5C12.7812 4 13 4.21875 13 4.5V12.5C13 12.7812 12.7812 13 12.5 13H4.5C4.21875 13 4 12.7812 4 12.5V12H9.5C10.3242 12 11 11.3242 11 10.5V4Z"
                transform="translate(0 -1)"
              />
            </svg>
          </span>
          <span aria-hidden="true">
            <svg viewBox="0 0 10 10" fill="none">
              <path
                d="M0.833008 4.64229L3.8336 8.12297L9.53471 1.50968"
                stroke="currentcolor"
                stroke-width="1.25"
              />
            </svg>
          </span>
        </span>
      </button>
      <a href={resolve('/(docs)/svelte/[slug]', { slug: 'quick-start' })}>Get started</a>
    </div>
  </div>

  <nav aria-label="Site">
    <div>
      <a href={npm} rel="external noopener noreferrer" aria-label="npm">
        <Npm />
      </a>
      <a href={github} rel="external noopener noreferrer" aria-label="GitHub">
        <GitHub />
      </a>
    </div>
    <span>v{version}</span>
  </nav>
</aside>

{#snippet svelteLockup()}
  <svg viewBox="0 0 519 139" aria-hidden="true">
    <path
      fill="#ff3e00"
      d="M172.39,100.41a24.1,24.1,0,0,1-13.72-3.87,19.86,19.86,0,0,1-8-10.61L159,82.86a15.4,15.4,0,0,0,5.45,6.6,14.37,14.37,0,0,0,8.27,2.43,12.14,12.14,0,0,0,7.88-2.38,8.29,8.29,0,0,0,2.94-6.82,7.43,7.43,0,0,0-.81-3.45,10.32,10.32,0,0,0-1.83-2.6,12.36,12.36,0,0,0-3.16-2.09c-1.42-.71-2.59-1.25-3.53-1.62s-2.32-.87-4.13-1.49c-2.28-.8-4-1.42-5.12-1.88a37.86,37.86,0,0,1-4.47-2.25,16.37,16.37,0,0,1-4.18-3.16A15.43,15.43,0,0,1,153.81,60a14.77,14.77,0,0,1,4-16.79q5.12-4.51,13.89-4.51,7.34,0,12.06,3.23a15.63,15.63,0,0,1,6.35,8.61l-8.18,2.73a9.57,9.57,0,0,0-4-4.39A13.3,13.3,0,0,0,171,47.24a10.7,10.7,0,0,0-6.69,1.87,6.28,6.28,0,0,0-2.42,5.29,5.52,5.52,0,0,0,1.87,4.09,13,13,0,0,0,3.92,2.64c1.36.57,3.44,1.33,6.22,2.3,1.7.63,3,1.09,3.79,1.41s2,.83,3.62,1.57a25.79,25.79,0,0,1,3.67,2,34.36,34.36,0,0,1,3,2.43,12.86,12.86,0,0,1,2.6,3.11,17.06,17.06,0,0,1,1.53,3.84,17.42,17.42,0,0,1,.64,4.81q0,8.36-5.71,13.08T172.39,100.41Zm54.62-1L206.56,39.74h9.54l13.55,41.58a66.19,66.19,0,0,1,1.88,6.82,63.43,63.43,0,0,1,1.87-6.82l13.38-41.58h9.46L235.87,99.39Zm47.29,0V39.74h37v8.35H283.17V64.45h18.15V72.8H283.17V91h30v8.35Zm61.44,0V39.74h8.87V90.87h29.14v8.52Zm71.41-51.13V99.39h-8.86V48.26H381.42V39.74H424v8.52Zm35.2,51.13V39.74h37v8.35H451.21V64.45h18.15V72.8H451.21V91h30v8.35Z"
    />
    <path
      fill="#ff3e00"
      d="M110.23,28.39C99.83,13.51,79.29,9.1,64.44,18.56L38.36,35.18a29.9,29.9,0,0,0-13.52,20,31.53,31.53,0,0,0,3.1,20.24,29.94,29.94,0,0,0-4.47,11.18,31.86,31.86,0,0,0,5.45,24.12c10.4,14.88,30.94,19.29,45.79,9.83L100.79,104a30,30,0,0,0,13.52-20,31.52,31.52,0,0,0-3.11-20.23,30.13,30.13,0,0,0,4.48-11.18,31.9,31.9,0,0,0-5.45-24.12"
    />
    <path
      fill="#fff"
      d="M61.89,112.16a20.73,20.73,0,0,1-22.24-8.25,19.14,19.14,0,0,1-3.27-14.5A17,17,0,0,1,37,87l.49-1.5,1.34,1A33.78,33.78,0,0,0,49,91.56l1,.29-.09,1A5.9,5.9,0,0,0,51,96.7a6.25,6.25,0,0,0,6.7,2.48,5.85,5.85,0,0,0,1.6-.7L85.34,81.86a5.42,5.42,0,0,0,2.45-3.64,5.77,5.77,0,0,0-1-4.37,6.25,6.25,0,0,0-6.7-2.48,5.72,5.72,0,0,0-1.6.7l-10,6.35a19.1,19.1,0,0,1-5.29,2.32A20.72,20.72,0,0,1,41,72.5,19.16,19.16,0,0,1,37.75,58a18,18,0,0,1,8.13-12.06L72,29.32A19.05,19.05,0,0,1,77.26,27a20.71,20.71,0,0,1,22.23,8.25,19.14,19.14,0,0,1,3.28,14.5,20.15,20.15,0,0,1-.62,2.43l-.5,1.5-1.33-1a33.78,33.78,0,0,0-10.2-5.1l-1-.29.09-1a5.86,5.86,0,0,0-1.06-3.88A6.23,6.23,0,0,0,81.49,40a5.72,5.72,0,0,0-1.6.7L53.8,57.29a5.45,5.45,0,0,0-2.45,3.63,5.84,5.84,0,0,0,1,4.38A6.25,6.25,0,0,0,59,67.78a6,6,0,0,0,1.6-.7l10-6.34a18.61,18.61,0,0,1,5.3-2.33,20.7,20.7,0,0,1,22.23,8.24,19.16,19.16,0,0,1,3.28,14.5,18,18,0,0,1-8.13,12.06L67.19,109.83a19.18,19.18,0,0,1-5.3,2.33"
    />
  </svg>
{/snippet}

<style>
  aside {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 8);
  }

  aside > div {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) * 5);
  }

  aside h1 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: var(--text-4xl);
    font-weight: var(--font-weight-semibold);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    text-wrap: balance;
    color: var(--color-gray-900);
  }

  aside h1 > span {
    margin-block-start: calc(var(--spacing) * 14);
    font-size: var(--text-3xl);
    line-height: var(--leading-tight);
    text-wrap: pretty;
    color: var(--color-gray-500);
  }

  aside h1 > span > span:first-child {
    color: var(--color-gray-900);
  }

  aside h1 > span svg {
    /* Tailwind's preflight makes every svg display: block, which breaks the line */
    display: inline-block;
    /* an svg with no width attribute defaults to 100%; auto lets the viewBox's
       ratio size it against the height instead */
    inline-size: auto;
    block-size: 1.15em;
  }

  aside > div > p {
    line-height: var(--leading-snug);
    text-wrap: pretty;
    color: var(--color-gray-600);
  }

  aside > div > div {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: calc(var(--spacing) * 2);
  }

  aside button,
  aside > div > div > a {
    position: relative;
    display: flex;
    block-size: calc(var(--spacing) * 9);
    flex-shrink: 0;
    align-items: center;
    gap: calc(var(--spacing) * 2);
    border: 1px solid;
    border-radius: var(--radius-md);
    padding-inline: calc(var(--spacing) * 3.5);
    font-size: var(--text-xs);
    white-space: nowrap;
  }

  /* 36px of shell, 44px of target — block-only so the two never overlap */
  aside button::before,
  aside > div > div > a::before {
    content: '';
    position: absolute;
    inset-block: calc(var(--spacing) * -1);
    inset-inline: 0;
  }

  aside button {
    flex-grow: 1;
    /* trailing icon: 2px less on its side reads as even */
    padding-inline-end: calc(var(--spacing) * 3);
    border-color: var(--color-gray-950);
    background-color: var(--color-gray-950);
    font-family: var(--font-mono);
    color: var(--color-content);
    transition: background-color 150ms var(--ease-out);
  }

  aside button:hover {
    border-color: var(--color-gray-800);
    background-color: var(--color-gray-800);
  }

  aside button > span:nth-child(3) {
    position: relative;
    margin-inline-start: auto;
    flex-shrink: 0;
    inline-size: calc(var(--spacing) * 3.5);
    block-size: calc(var(--spacing) * 3.5);
  }

  aside button > span:nth-child(3) > span {
    position: absolute;
    inset: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      opacity 150ms var(--ease-out),
      transform 150ms var(--ease-out);
  }

  aside button > span:nth-child(3) svg {
    inline-size: calc(var(--spacing) * 3);
    block-size: calc(var(--spacing) * 3);
  }

  aside button > span:nth-child(3) > span:last-child {
    opacity: 0;
    transform: scale(0.7);
  }

  aside button[data-copied] > span:nth-child(3) > span:first-child {
    opacity: 0;
    transform: scale(0.7);
  }

  aside button[data-copied] > span:nth-child(3) > span:last-child {
    opacity: 1;
    transform: scale(1);
  }

  @media (prefers-reduced-motion: reduce) {
    aside button > span:nth-child(3) > span {
      transition: none;
    }
  }

  aside > div > div > a {
    border-color: var(--color-gray-200);
    background-color: var(--color-content);
    font-weight: var(--font-weight-medium);
    color: var(--color-gray-800);
    transition: background-color 150ms var(--ease-out);
  }

  aside > div > div > a:hover {
    background-color: var(--color-gray-100);
  }

  aside button:focus-visible,
  aside a:focus-visible {
    outline: 2px solid var(--color-gray-900);
    outline-offset: calc(var(--spacing) * 0.5);
  }

  aside > div > p a:focus-visible,
  aside nav a:focus-visible {
    border-radius: var(--radius-xs);
  }

  aside nav {
    display: flex;
    margin-block-start: auto;
    margin-inline-start: calc(var(--spacing) * -1.5);
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--spacing) * 3);
    padding-block-start: calc(var(--spacing) * 8);
  }

  aside nav > div {
    display: flex;
    align-items: center;
  }

  aside nav a {
    display: inline-flex;
    padding: calc(var(--spacing) * 1.5);
    color: var(--color-gray-700);
    transition: color 150ms var(--ease-out);
  }

  aside nav a:hover {
    color: var(--color-gray-950);
  }

  aside nav span {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
    color: var(--color-gray-400);
  }

  aside > div > p a {
    color: var(--color-gray-900);
    text-decoration: underline;
    text-decoration-thickness: from-font;
    text-underline-position: from-font;
    text-decoration-skip-ink: auto;
    text-decoration-color: var(--color-gray-300);
    text-underline-offset: 0.16em;
    transition: text-decoration-color 150ms var(--ease-out);
  }

  aside > div > p a:hover {
    text-decoration-color: var(--color-gray-900);
  }

  @media (width >= 40rem) {
    aside {
      max-inline-size: var(--width-rail);
    }
  }

  @media (width >= 64rem) {
    aside {
      position: sticky;
      inset-block-start: calc(var(--spacing) * 12);
      align-self: start;
      block-size: calc(100dvh - calc(var(--spacing) * 24));
      min-block-size: max-content;
    }
  }
</style>
