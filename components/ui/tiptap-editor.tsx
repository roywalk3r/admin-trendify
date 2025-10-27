"use client"
import React, { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"

export type TiptapEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Link.configure({ openOnClick: true, linkOnPaste: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-32 p-3 focus:outline-none",
        placeholder: placeholder || "Start typing...",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    // Avoid loops on same content
    if ((value || "") !== current) {
      editor.commands.setContent(value || "", false)
    }
  }, [value, editor])

  if (!editor) return null

  const exec = (fn: () => void) => fn()

  const addTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().toggleBold().run())}>B</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().toggleItalic().run())}><em>I</em></button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().toggleUnderline().run())}><u>U</u></button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().toggleBulletList().run())}>• List</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().toggleOrderedList().run())}>1. List</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().setParagraph().run())}>P</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}>H2</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={addTable}>Table</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().addColumnBefore().run())}>+Col</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().addRowAfter().run())}>+Row</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().deleteColumn().run())}>-Col</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().deleteRow().run())}>-Row</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().mergeCells().run())}>Merge</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().deleteTable().run())}>Del Table</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec(() => editor.chain().focus().unsetAllMarks().clearNodes().run())}>Clear</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
