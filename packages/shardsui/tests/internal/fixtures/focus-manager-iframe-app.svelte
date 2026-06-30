<script lang="ts">
  import { mount, unmount } from 'svelte'
  import FocusManagerIframePopover from './focus-manager-iframe-popover.svelte'

  let innerRoot = $state<HTMLDivElement | null>(null)

  $effect(() => {
    const container = innerRoot
    if (!container) return

    const iframe = document.createElement('iframe')
    iframe.setAttribute('data-testid', 'iframe')
    iframe.src = 'about:blank'
    iframe.style.height = '300px'
    container.appendChild(iframe)

    const iframeDocument = iframe.contentWindow?.document
    let app: ReturnType<typeof mount> | undefined

    if (iframeDocument) {
      iframeDocument.open()
      iframeDocument.write('<div id="rootIframe"></div>')
      iframeDocument.close()

      const root = iframeDocument.getElementById('rootIframe')
      if (root) {
        app = mount(FocusManagerIframePopover, { target: root })
      }
    }

    return () => {
      if (app) unmount(app)
      iframe.remove()
    }
  })
</script>

<!-- svelte-ignore a11y_invalid_attribute -->
<a href="#">Outside link 1</a>
<div bind:this={innerRoot}></div>
<!-- svelte-ignore a11y_invalid_attribute -->
<a href="#">Outside link 2</a>
