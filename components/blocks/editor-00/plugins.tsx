import { useCallback, useEffect, useState } from "react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { TRANSFORMERS } from "@lexical/markdown"
import { mergeRegister } from "@lexical/utils"
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  REDO_COMMAND,
  UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical"
import { $createQuoteNode } from "@lexical/rich-text"
import { $setBlocksType } from "@lexical/selection"
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list"
import { INSERT_TABLE_COMMAND } from "@lexical/table"
import { TOGGLE_LINK_COMMAND } from "@lexical/link"
import {
  Bold,
  Italic,
  Link2,
  List as ListIcon,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Table,
  Underline,
  Undo2,
} from "lucide-react"

import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [blockType, setBlockType] = useState("paragraph")
  const [isLink, setIsLink] = useState(false)

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))
      setIsStrikethrough(selection.hasFormat("strikethrough"))

      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()
      const parent = element.getParent()
      let type = element.getType()

      if ($isListNode(element)) {
        const listType = element.getListType()
        type = listType === "number" ? "number" : "bullet"
      } else if (parent && $isListNode(parent)) {
        const listType = parent.getListType()
        type = listType === "number" ? "number" : "bullet"
      }

      setBlockType(type)

      let selectionHasLink = false
      if ($isTextNode(anchorNode)) {
        const textParent = anchorNode.getParent()
        selectionHasLink = !!textParent && textParent.getType?.() === "link"
      } else {
        selectionHasLink = anchorNode.getType?.() === "link"
      }
      setIsLink(selectionHasLink)
    }
  }, [])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => updateToolbar())
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, updateToolbar])

  const toggleList = (type: "bullet" | "number") => {
    if (blockType === type) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(
        type === "bullet"
          ? INSERT_UNORDERED_LIST_COMMAND
          : INSERT_ORDERED_LIST_COMMAND,
        undefined
      )
    }
  }

  const toggleLink = () => {
    const url = isLink ? null : window.prompt("Enter URL")?.trim()
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null)
  }

  const insertTable = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: "3", columns: "3", includeHeaders: true })
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Button
        type="button"
        variant={isBold ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={isItalic ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={isUnderline ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={isStrikethrough ? "secondary" : "ghost"}
        size="icon"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant={blockType === "bullet" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => toggleList("bullet")}
      >
        <ListIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={blockType === "number" ? "secondary" : "ghost"}
        size="icon"
        onClick={() => toggleList("number")}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={blockType === "quote" ? "secondary" : "ghost"}
        size="icon"
        onClick={() =>
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              if (blockType === "quote") {
                $setBlocksType(selection, () => $createParagraphNode())
              } else {
                $setBlocksType(selection, () => $createQuoteNode())
              }
            }
          })
        }
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={isLink ? "secondary" : "ghost"}
        size="icon"
        onClick={toggleLink}
      >
        <Link2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={insertTable}
      >
        <Table className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function Plugins({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-1 border-b bg-muted/40 px-2 py-1.5">
        <ToolbarPlugin />
      </div>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div className="min-h-[320px]">
              <ContentEditable placeholder={placeholder} />
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />

        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <TablePlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      </div>
    </div>
  )
}
