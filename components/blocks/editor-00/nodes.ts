import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { LinkNode } from "@lexical/link"
import { ListItemNode, ListNode } from "@lexical/list"
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table"
import { CodeNode } from "@lexical/code"
import {
  Klass,
  LexicalNode,
  LexicalNodeReplacement,
  ParagraphNode,
  TextNode,
} from "lexical"

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =
  [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    CodeNode,
  ]
