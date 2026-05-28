import { contains } from '$lib/internal/dom'
import {
  getComputedStyle,
  getNodeName,
  getParentNode,
  isElement,
  isHTMLElement
} from '@floating-ui/utils/dom'
import { isElementVisible } from './list-navigation'

export type FocusableElement = HTMLElement | SVGElement

const CANDIDATE_SELECTOR =
  'a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]'

function getParentElement(element: Element): Element | null {
  // `getParentNode` returns `<html>` itself, so the walk needs an explicit stop.
  const parent = getParentNode(element)
  return parent !== element && isElement(parent) ? parent : null
}

function getDetailsSummary(details: Element) {
  for (const child of Array.from(details.children)) {
    if (getNodeName(child) === 'summary') {
      return child
    }
  }

  return null
}

function isWithinOpenDetailsSummary(element: Element, details: Element) {
  const summary = getDetailsSummary(details)
  return !!summary && (element === summary || contains(summary, element))
}

function isFocusableCandidate(element: Element | null): element is FocusableElement {
  if (element == null) return false
  const nodeName = getNodeName(element)

  return (
    element.matches(CANDIDATE_SELECTOR) &&
    (nodeName !== 'summary' ||
      (element.parentElement != null &&
        getNodeName(element.parentElement) === 'details' &&
        getDetailsSummary(element.parentElement) === element)) &&
    (nodeName !== 'details' || getDetailsSummary(element) == null) &&
    (nodeName !== 'input' || (element as HTMLInputElement).type !== 'hidden')
  )
}

function isFocusableElement(element: Element | null): element is FocusableElement {
  if (!isFocusableCandidate(element) || !element.isConnected || element.matches(':disabled')) {
    return false
  }

  for (let current: Element | null = element; current; current = getParentElement(current)) {
    const isAncestor = current !== element
    const isSlot = getNodeName(current) === 'slot'

    if (current.hasAttribute('inert')) {
      return false
    }

    if (
      (isAncestor &&
        getNodeName(current) === 'details' &&
        !(current as HTMLDetailsElement).open &&
        !isWithinOpenDetailsSummary(element, current)) ||
      current.hasAttribute('hidden') ||
      (!isSlot && !isVisibleInTabbableTree(current, isAncestor))
    ) {
      return false
    }
  }

  return true
}

function isVisibleInTabbableTree(element: Element, isAncestor: boolean) {
  const styles = getComputedStyle(element)

  if (isAncestor) {
    return styles.display !== 'none'
  }

  return isElementVisible(element, styles)
}

function getTabIndex(element: FocusableElement) {
  const tabIndex = element.tabIndex
  if (tabIndex < 0) {
    const nodeName = getNodeName(element)
    if (
      nodeName === 'details' ||
      nodeName === 'audio' ||
      nodeName === 'video' ||
      (isHTMLElement(element) && element.isContentEditable)
    ) {
      return 0
    }
  }

  return tabIndex
}

function getNamedRadioInput(element: FocusableElement) {
  if (getNodeName(element) !== 'input') {
    return null
  }

  const input = element as HTMLInputElement
  return input.type === 'radio' && input.name !== '' ? input : null
}

function isTabbableRadio(element: FocusableElement, candidates: FocusableElement[]) {
  const input = getNamedRadioInput(element)
  if (!input) {
    return true
  }

  const checkedRadio = candidates.find((candidate) => {
    const radio = getNamedRadioInput(candidate)
    return radio?.name === input.name && radio.form === input.form && radio.checked
  })

  if (checkedRadio) {
    return checkedRadio === input
  }

  return (
    candidates.find((candidate) => {
      const radio = getNamedRadioInput(candidate)
      return radio?.name === input.name && radio.form === input.form
    }) === input
  )
}

function collectDescendants<T extends Element>(
  container: ParentNode,
  matches: (element: Element) => element is T
): T[] {
  const collected: T[] = []

  function walk(parent: ParentNode) {
    for (const child of parent.children) {
      if (matches(child)) collected.push(child)
      walk(child)
    }
  }

  walk(container)
  return collected
}

export const TYPEABLE_SELECTOR =
  "input:not([type='hidden']):not([disabled])," +
  "[contenteditable]:not([contenteditable='false']),textarea:not([disabled])"

export function isTypeableElement(element: unknown): boolean {
  return isHTMLElement(element) && element.matches(TYPEABLE_SELECTOR)
}

export function isTypeableCombobox(element: Element | null): boolean {
  if (!element) return false
  return element.getAttribute('role') === 'combobox' && isTypeableElement(element)
}

export function isTabbable(element: Element | null): element is FocusableElement {
  return isFocusableElement(element) && getTabIndex(element) >= 0
}

export function focusable(container: Element) {
  return collectDescendants(container, isFocusableCandidate).filter(isFocusableElement)
}

export function tabbable(container: Element) {
  const candidates = focusable(container)
  return candidates.filter(
    (element) => getTabIndex(element) >= 0 && isTabbableRadio(element, candidates)
  )
}

function getTabbableNearElement(referenceElement: Element | null, dir: 1 | -1) {
  if (!referenceElement) {
    return null
  }

  const list = tabbable(referenceElement.ownerDocument.body)
  const elementCount = list.length
  const index = list.indexOf(referenceElement as FocusableElement)
  if (index === -1) {
    return null
  }

  const nextIndex = (index + dir + elementCount) % elementCount
  return list[nextIndex]
}

export function getTabbableAfterElement(referenceElement: Element | null): FocusableElement | null {
  return getTabbableNearElement(referenceElement, 1)
}

export function getTabbableBeforeElement(
  referenceElement: Element | null
): FocusableElement | null {
  return getTabbableNearElement(referenceElement, -1)
}

function getTabbableInDocument(doc: Document, dir: 1 | -1): FocusableElement | undefined {
  const list = tabbable(doc.body)
  if (list.length === 0) {
    return undefined
  }

  const index = list.indexOf(doc.activeElement as FocusableElement)
  const nextIndex = index === -1 ? (dir === 1 ? 0 : list.length - 1) : index + dir

  return list[nextIndex]
}

export function getNextTabbable(referenceElement: Element | null): FocusableElement | null {
  const doc = referenceElement?.ownerDocument ?? document
  return getTabbableInDocument(doc, 1) || (referenceElement as FocusableElement | null)
}

export function getPreviousTabbable(referenceElement: Element | null): FocusableElement | null {
  const doc = referenceElement?.ownerDocument ?? document
  return getTabbableInDocument(doc, -1) || (referenceElement as FocusableElement | null)
}

/** The `tabindex` focus management replaced on an element, or `'0'`/`'-1'` where it wrote one. */
export const managedTabIndex = new WeakMap<Element, string>()

export function disableFocusInside(container: HTMLElement) {
  const tabbableElements = tabbable(container)
  tabbableElements.forEach((element) => {
    managedTabIndex.set(element, element.getAttribute('tabindex') || '')
    element.setAttribute('tabindex', '-1')
  })
}

export function enableFocusInside(container: HTMLElement) {
  const elements = collectDescendants(
    container,
    (element): element is HTMLElement => isHTMLElement(element) && managedTabIndex.has(element)
  )
  elements.forEach((element) => {
    const tabindex = managedTabIndex.get(element)
    managedTabIndex.delete(element)
    if (tabindex) {
      element.setAttribute('tabindex', tabindex)
    } else {
      element.removeAttribute('tabindex')
    }
  })
}

export function isOutsideEvent(event: FocusEvent, container: Element) {
  const relatedTarget = event.relatedTarget as HTMLElement | null
  return !relatedTarget || !contains(container, relatedTarget)
}
