"use client"

import { useMemo } from "react"
import { SerializedEditorState } from "lexical"

import { Editor } from "@/components/blocks/editor-00"

export type TiptapEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

function parseSerialized(value?: string): SerializedEditorState | undefined {
  if (!value) return undefined
  try {
    const parsed = JSON.parse(value)
    if (parsed?.root) return parsed
  } catch {
    return undefined
  }
}

export default function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
  const initialState = useMemo(() => parseSerialized(value), [value])
  const initialHtml = useMemo(() => (initialState ? undefined : value), [initialState, value])

  return (
    <Editor
      placeholder={placeholder}
      editorSerializedState={initialState}
      initialHtml={initialHtml}
      onHtmlChange={onChange}
    />
  )
}
