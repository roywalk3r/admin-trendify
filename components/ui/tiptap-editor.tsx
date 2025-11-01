"use client"
import React from "react"
import { Textarea } from "@/components/ui/textarea"

export type TiptapEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
  return (
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Start typing..."}
      className="min-h-32"
    />
  )
}
