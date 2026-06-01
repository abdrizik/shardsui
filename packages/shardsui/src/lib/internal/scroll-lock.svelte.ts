import { isOverflowElement } from '@floating-ui/utils/dom'
import { on } from 'svelte/events'
import { AnimationFrame } from './animation-frame.svelte'
import { isIOS, isWebKit } from './detect-browser'
import { Timeout } from './timeout'

function ownerDocument(node: Element | null): Document {
  return node?.ownerDocument ?? document
}

function ownerWindow(node: Element | Document): Window & typeof globalThis {
  const doc = 'defaultView' in node ? node : node.ownerDocument
  return doc.defaultView ?? window
}

function getViewportScroller(html: HTMLElement, body: HTMLElement): HTMLElement {
  return isOverflowElement(html) ? html : body
}

function isPageScrollLocked(win: Window, html: HTMLElement, body: HTMLElement): boolean {
  return /hidden|clip/.test(win.getComputedStyle(getViewportScroller(html, body)).overflowY)
}

function hasInsetScrollbars(referenceElement: Element | null): boolean {
  const doc = ownerDocument(referenceElement)
  const win = ownerWindow(doc)
  return win.innerWidth - doc.documentElement.clientWidth > 0
}

function preventScrollOverlayScrollbars(referenceElement: Element | null): () => void {
  const doc = ownerDocument(referenceElement)
  const html = doc.documentElement
  const body = doc.body

  // A lock on <body> has no effect while <html> carries an `overflow` style; locking <html>
  // when <body> carries one instead shifts sticky elements.
  const elementToLock = getViewportScroller(html, body)
  const originalElementToLockStyles = {
    overflowY: elementToLock.style.overflowY,
    overflowX: elementToLock.style.overflowX
  }

  Object.assign(elementToLock.style, {
    overflowY: 'hidden',
    overflowX: 'hidden'
  })

  return () => {
    Object.assign(elementToLock.style, originalElementToLockStyles)
  }
}

function preventScrollInsetScrollbars(referenceElement: Element | null): () => void {
  const doc = ownerDocument(referenceElement)
  const html = doc.documentElement
  const body = doc.body
  const win = ownerWindow(html)

  let originalHtmlStyles: Partial<CSSStyleDeclaration> = {}
  let originalBodyStyles: Partial<CSSStyleDeclaration> = {}
  const resizeFrame = new AnimationFrame()

  // Pinch-zoom in Safari causes a shift.
  if (isWebKit && (win.visualViewport?.scale ?? 1) !== 1) {
    return () => {}
  }

  function lockScroll() {
    const htmlScrollbarGutterValue = win.getComputedStyle(html).scrollbarGutter || ''
    const hasBothEdges = htmlScrollbarGutterValue.includes('both-edges')
    const scrollbarGutterValue = hasBothEdges ? 'stable both-edges' : 'stable'

    originalHtmlStyles = {
      scrollbarGutter: html.style.scrollbarGutter,
      overflowY: html.style.overflowY,
      overflowX: html.style.overflowX
    }

    const elementToLock = getViewportScroller(html, body)
    originalBodyStyles = {
      overflowY: body.style.overflowY,
      overflowX: body.style.overflowX
    }

    html.style.scrollbarGutter = scrollbarGutterValue
    elementToLock.style.overflowY = 'hidden'
    elementToLock.style.overflowX = 'hidden'
  }

  function cleanup() {
    Object.assign(html.style, originalHtmlStyles)
    Object.assign(body.style, originalBodyStyles)
  }

  function onresize() {
    cleanup()
    resizeFrame.request(lockScroll)
  }

  lockScroll()
  const off = on(win, 'resize', onresize)

  return () => {
    resizeFrame.cancel()
    cleanup()
    off()
  }
}

class ScrollLocker {
  #lockCount = 0
  #restore: (() => void) | null = null
  #lockTimeout = new Timeout()
  #unlockTimeout = new Timeout()

  // Lock and unlock are deferred a tick so one popup closing as another opens keeps the existing
  // lock instead of unlocking and relocking, which would lose the scroll position.
  acquire(referenceElement: Element | null) {
    this.#lockCount += 1
    if (this.#lockCount === 1 && this.#restore === null) {
      this.#lockTimeout.start(0, () => this.#lock(referenceElement))
    }
    return this.release
  }

  release = () => {
    this.#lockCount -= 1
    if (this.#lockCount === 0 && this.#restore) {
      this.#unlockTimeout.start(0, this.#unlock)
    }
  }

  #unlock = () => {
    if (this.#lockCount === 0 && this.#restore) {
      this.#restore()
      this.#restore = null
    }
  }

  #lock(referenceElement: Element | null) {
    if (this.#lockCount === 0 || this.#restore !== null) {
      return
    }

    const doc = ownerDocument(referenceElement)
    const html = doc.documentElement
    const body = doc.body
    const win = ownerWindow(html)
    if (isPageScrollLocked(win, html, body)) {
      const observer = new win.MutationObserver(() => {
        if (isPageScrollLocked(win, html, body)) return
        observer.disconnect()
        this.#restore = null
        this.#lock(referenceElement)
      })
      const options: MutationObserverInit = { attributes: true }
      observer.observe(html, options)
      observer.observe(body, options)

      this.#restore = () => observer.disconnect()
      return
    }

    const hasOverlayScrollbars = isIOS || !hasInsetScrollbars(referenceElement)

    // On iOS, scroll locking does not work if the navbar is collapsed.
    this.#restore = hasOverlayScrollbars
      ? preventScrollOverlayScrollbars(referenceElement)
      : preventScrollInsetScrollbars(referenceElement)
  }
}

const SCROLL_LOCKER = new ScrollLocker()

type ScrollLockOptions = {
  enabled: boolean
  referenceElement?: Element | null
}

export function scrollLock(options: () => ScrollLockOptions): void {
  const enabled = $derived(options().enabled)
  const referenceElement = $derived(options().referenceElement)

  $effect(() => {
    if (!enabled) return

    return SCROLL_LOCKER.acquire(referenceElement ?? null)
  })
}
