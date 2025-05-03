"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Keyboard shortcuts to help you navigate the dashboard more efficiently.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="navigation">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="views">Views</TabsTrigger>
          </TabsList>

          <TabsContent value="navigation" className="space-y-4 pt-4">
            <div className="space-y-2">
              {[
                { keys: ["Ctrl", "/"], description: "Open keyboard shortcuts" },
                { keys: ["Ctrl", "B"], description: "Toggle sidebar" },
                { keys: ["Ctrl", "J"], description: "Toggle activity feed" },
                { keys: ["Tab"], description: "Navigate between focusable elements" },
                { keys: ["Shift", "Tab"], description: "Navigate backwards" },
                { keys: ["Esc"], description: "Close modal / Cancel current action" },
              ].map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <kbd
                        key={keyIndex}
                        className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 pt-4">
            <div className="space-y-2">
              {[
                { keys: ["Ctrl", "S"], description: "Save current changes" },
                { keys: ["Ctrl", "N"], description: "Create new item" },
                { keys: ["Ctrl", "F"], description: "Search" },
                { keys: ["Ctrl", "E"], description: "Edit selected item" },
                { keys: ["Ctrl", "D"], description: "Delete selected item" },
                { keys: ["Ctrl", "Z"], description: "Undo last action" },
              ].map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <kbd
                        key={keyIndex}
                        className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="views" className="space-y-4 pt-4">
            <div className="space-y-2">
              {[
                { keys: ["G", "D"], description: "Go to Dashboard" },
                { keys: ["G", "T"], description: "Go to Team" },
                { keys: ["G", "O"], description: "Go to OAuth Clients" },
                { keys: ["G", "A"], description: "Go to Apps" },
                { keys: ["G", "S"], description: "Go to Settings" },
                { keys: ["?"], description: "Show this help dialog" },
              ].map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <kbd
                        key={keyIndex}
                        className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
