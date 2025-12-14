"use client"

import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html"
import { EditorState, SerializedEditorState, $getRoot } from "lexical"
import { useEffect, useRef } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { TooltipProvider } from "@/components/ui/tooltip"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"

function InitialHtmlPlugin({ html }: { html?: string }) {
  const [editor] = useLexicalComposerContext()
  const hasHydrated = useRef(false)

  useEffect(() => {
    if (hasHydrated.current) return
    if (!html) return
    hasHydrated.current = true
    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(html, "text/html")
      const nodesFromHtml = $generateNodesFromDOM(editor, dom)
      const root = $getRoot()
      root.clear()
      root.append(...nodesFromHtml)
    })
  }, [editor, html])

  return null
}

export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  onHtmlChange,
  initialHtml,
  placeholder = "Start typing...",
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  onChange?: (editorState: EditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  onHtmlChange?: (html: string) => void
  initialHtml?: string
  placeholder?: string
}) {
  const initialEditorState = editorState
    ? editorState
    : editorSerializedState
      ? JSON.stringify(editorSerializedState)
      : undefined

  const initialConfig: InitialConfigType = {
    namespace: "Editor",
    theme: editorTheme,
    nodes,
    onError: (error: Error) => {
      console.error(error)
    },
    editorState: initialEditorState,
  }

  return (
    <div className="bg-background overflow-hidden rounded-lg border shadow">
      <LexicalComposer initialConfig={initialConfig}>
        <TooltipProvider>
          <Plugins placeholder={placeholder} />
          <InitialHtmlPlugin html={initialHtml} />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState, editor) => {
              onChange?.(editorState)
              onSerializedChange?.(editorState.toJSON())
              editorState.read(() => {
                const html = $generateHtmlFromNodes(editor, null)
                onHtmlChange?.(html)
              })
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}
