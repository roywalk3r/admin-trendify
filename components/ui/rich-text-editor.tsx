"use client"
import React, { useEffect, useRef } from "react"

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ""
    }
  }, [value])

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg)
    if (ref.current) {
      onChange(ref.current.innerHTML)
    }
  }

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("bold")}>B</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("italic")}><em>I</em></button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("underline")}><u>U</u></button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("insertUnorderedList")}>• List</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("insertOrderedList")}>1. List</button>
        <button type="button" className="px-2 py-1 text-sm border rounded" onClick={() => exec("removeFormat")}>Clear</button>
      </div>
      <div
        ref={ref}
        className="min-h-32 p-3 prose prose-sm max-w-none focus:outline-none"
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder || "Start typing..."}
        suppressContentEditableWarning
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  )
}
