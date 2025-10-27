"use client"
import React from "react"
import DOMPurify from "isomorphic-dompurify"

type Props = {
  html: string | null | undefined
  className?: string
}

export default function SafeHtml({ html, className }: Props) {
  const clean = React.useMemo(() => {
    const src = html || ""
    return DOMPurify.sanitize(src, {
      ALLOWED_TAGS: [
        'p','strong','em','u','s','a','ul','ol','li','br','span','h1','h2','h3','h4','h5','h6','blockquote','code','pre','table','thead','tbody','tr','th','td'
      ],
      ALLOWED_ATTR: ['href','target','rel','colspan','rowspan','class','style'],
      ADD_ATTR: ['target','rel'],
      FORBID_TAGS: ['script','iframe','object','embed'],
      FORBID_ATTR: ['onerror','onclick','onload'],
    })
  }, [html])

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  )
}
