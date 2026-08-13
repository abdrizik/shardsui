<script lang="ts">
  import { Drawer } from '@shardsui/svelte/drawer'
</script>

<Drawer.Root>
  <Drawer.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
  >
    Open group
  </Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Backdrop
      class="fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] [--backdrop-opacity:0.2] data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:opacity-0 data-swiping:duration-0 supports-[-webkit-touch-callout:none]:absolute"
    />
    <Drawer.Viewport class="fixed inset-0 flex items-end justify-center">
      <Drawer.Popup
        class="group/popup relative -mb-12 h-(--drawer-height,auto) max-h-[calc(80vh+3rem)] w-full origin-[50%_calc(100%-var(--bleed))] transform-[translateY(calc(var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--shrink)*var(--height))))_scale(var(--scale))] touch-auto overflow-y-auto overscroll-contain rounded-t-2xl bg-gray-50 px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0)+3rem)] text-gray-900 outline-1 outline-gray-200 [--bleed:3rem] [--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))-var(--bleed)))] [--peek:1rem] [--scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))] [--scale:clamp(0,calc(var(--scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--shrink:calc(1-var(--scale))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-step:0.05] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),height_450ms_cubic-bezier(0.32,0.72,0,1),opacity_450ms_cubic-bezier(0.32,0.72,0,1)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-transparent after:transition-[background-color] after:duration-450 after:ease-[cubic-bezier(0.32,0.72,0,1)] after:content-[''] data-ending-style:transform-[translateY(calc(100%-var(--bleed)+2px))] data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-nested-drawer-open:h-[calc(var(--height)+var(--bleed))] data-nested-drawer-open:overflow-hidden data-nested-drawer-open:after:bg-black/5 data-nested-drawer-swiping:duration-0 data-ending-style:data-nested-drawer-swiping:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:transform-[translateY(calc(100%-var(--bleed)+2px))] data-swiping:duration-0 data-swiping:select-none data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*0.4s)]"
      >
        <div
          class="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-300 transition-opacity duration-200 group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100"
        ></div>
        <Drawer.Content
          class="mx-auto w-full max-w-lg transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100"
        >
          <Drawer.Title class="mb-1 text-center text-base font-semibold">Group</Drawer.Title>
          <Drawer.Description class="mb-4 text-center text-sm text-gray-600">
            Nested drawers stack while each stays independently focus managed.
          </Drawer.Description>

          <div class="flex items-center justify-end gap-4">
            <div class="mr-auto">
              <Drawer.Root>
                <Drawer.Trigger
                  class="-m-0.5 rounded px-1.5 py-0.5 text-sm text-gray-950 hover:bg-gray-950/5 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-950/10"
                >
                  Invite member
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Viewport class="fixed inset-0 flex items-end justify-center">
                    <Drawer.Popup
                      class="group/popup relative -mb-12 h-(--drawer-height,auto) max-h-[calc(80vh+3rem)] w-full origin-[50%_calc(100%-var(--bleed))] transform-[translateY(calc(var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--shrink)*var(--height))))_scale(var(--scale))] touch-auto overflow-y-auto overscroll-contain rounded-t-2xl bg-gray-50 px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0)+3rem)] text-gray-900 outline-1 outline-gray-200 [--bleed:3rem] [--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))-var(--bleed)))] [--peek:1rem] [--scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))] [--scale:clamp(0,calc(var(--scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--shrink:calc(1-var(--scale))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-step:0.05] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),height_450ms_cubic-bezier(0.32,0.72,0,1),opacity_450ms_cubic-bezier(0.32,0.72,0,1)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-transparent after:transition-[background-color] after:duration-450 after:ease-[cubic-bezier(0.32,0.72,0,1)] after:content-[''] data-ending-style:transform-[translateY(calc(100%-var(--bleed)+2px))] data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-nested-drawer-open:h-[calc(var(--height)+var(--bleed))] data-nested-drawer-open:overflow-hidden data-nested-drawer-open:after:bg-black/5 data-nested-drawer-swiping:duration-0 data-ending-style:data-nested-drawer-swiping:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:transform-[translateY(calc(100%-var(--bleed)+2px))] data-swiping:duration-0 data-swiping:select-none data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*0.4s)]"
                    >
                      <div
                        class="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-300 transition-opacity duration-200 group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100"
                      ></div>
                      <Drawer.Content
                        class="mx-auto w-full max-w-lg transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100"
                      >
                        <Drawer.Title class="mb-1 text-center text-base font-semibold">
                          Invite member
                        </Drawer.Title>
                        <Drawer.Description class="mb-4 text-center text-sm text-gray-600">
                          This drawer is taller to show variable-height stacking.
                        </Drawer.Description>

                        <div class="mb-4 grid gap-1.5 text-left">
                          <label class="text-sm font-semibold text-gray-700" for="invite-email">
                            Email
                          </label>
                          <input
                            id="invite-email"
                            class="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 text-sm font-normal text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 any-pointer-coarse:text-base"
                            type="email"
                            value="member@example.com"
                          />
                        </div>

                        <div class="mb-4 grid gap-1.5 text-left">
                          <label class="text-sm font-semibold text-gray-700" for="invite-note">
                            Note
                          </label>
                          <textarea
                            id="invite-note"
                            class="w-full resize-y rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 text-sm font-normal text-gray-900 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 any-pointer-coarse:text-base"
                            rows={3}>Join us for the next review session!</textarea
                          >
                        </div>

                        <div class="flex items-center justify-between">
                          <Drawer.Root>
                            <Drawer.Trigger
                              class="-m-0.5 rounded px-1.5 py-0.5 text-sm text-gray-950 hover:bg-gray-950/5 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-950/10"
                            >
                              Set permissions
                            </Drawer.Trigger>
                            <Drawer.Portal>
                              <Drawer.Viewport class="fixed inset-0 flex items-end justify-center">
                                <Drawer.Popup
                                  class="group/popup relative -mb-12 h-(--drawer-height,auto) max-h-[calc(80vh+3rem)] w-full origin-[50%_calc(100%-var(--bleed))] transform-[translateY(calc(var(--drawer-swipe-movement-y)-var(--stack-peek-offset)-(var(--shrink)*var(--height))))_scale(var(--scale))] touch-auto overflow-y-auto overscroll-contain rounded-t-2xl bg-gray-50 px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0)+3rem)] text-gray-900 outline-1 outline-gray-200 [--bleed:3rem] [--height:max(0px,calc(var(--drawer-frontmost-height,var(--drawer-height))-var(--bleed)))] [--peek:1rem] [--scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))] [--scale:clamp(0,calc(var(--scale-base)+(var(--stack-step)*var(--stack-progress))),1)] [--shrink:calc(1-var(--scale))] [--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))] [--stack-progress:clamp(0,var(--drawer-swipe-progress),1)] [--stack-step:0.05] [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),height_450ms_cubic-bezier(0.32,0.72,0,1),opacity_450ms_cubic-bezier(0.32,0.72,0,1)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-transparent after:transition-[background-color] after:duration-450 after:ease-[cubic-bezier(0.32,0.72,0,1)] after:content-[''] data-ending-style:transform-[translateY(calc(100%-var(--bleed)+2px))] data-ending-style:opacity-[0.9999] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-nested-drawer-open:h-[calc(var(--height)+var(--bleed))] data-nested-drawer-open:overflow-hidden data-nested-drawer-open:after:bg-black/5 data-nested-drawer-swiping:duration-0 data-ending-style:data-nested-drawer-swiping:duration-[calc(var(--drawer-swipe-strength)*0.4s)] data-starting-style:transform-[translateY(calc(100%-var(--bleed)+2px))] data-swiping:duration-0 data-swiping:select-none data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength)*0.4s)]"
                                >
                                  <div
                                    class="mx-auto mb-4 h-1 w-12 rounded-full bg-gray-300 transition-opacity duration-200 group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100"
                                  ></div>
                                  <Drawer.Content
                                    class="mx-auto w-full max-w-lg transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100"
                                  >
                                    <Drawer.Title class="mb-1 text-center text-base font-semibold">
                                      Permissions
                                    </Drawer.Title>
                                    <Drawer.Description
                                      class="mb-4 text-center text-sm text-gray-600"
                                    >
                                      The stack keeps growing — each drawer scales the ones beneath
                                      it.
                                    </Drawer.Description>

                                    <div class="mb-4 grid gap-2 text-left">
                                      {#each ['Editor', 'Reviewer', 'Viewer'] as role (role)}
                                        <label
                                          class="flex items-center gap-2.5 text-sm text-gray-700"
                                        >
                                          <input
                                            type="radio"
                                            name="role"
                                            value={role}
                                            checked={role === 'Editor'}
                                            class="size-4 accent-gray-900"
                                          />
                                          {role}
                                        </label>
                                      {/each}
                                    </div>

                                    <div class="flex justify-end">
                                      <Drawer.Close
                                        class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
                                      >
                                        Done
                                      </Drawer.Close>
                                    </div>
                                  </Drawer.Content>
                                </Drawer.Popup>
                              </Drawer.Viewport>
                            </Drawer.Portal>
                          </Drawer.Root>

                          <Drawer.Close
                            class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
                          >
                            Send invite
                          </Drawer.Close>
                        </div>
                      </Drawer.Content>
                    </Drawer.Popup>
                  </Drawer.Viewport>
                </Drawer.Portal>
              </Drawer.Root>
            </div>

            <Drawer.Close
              class="flex h-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-900 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-100"
            >
              Close
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
