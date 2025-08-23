"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

function JSONBlock({ value }: { value: any }) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }, [value])
  return (
    <pre className="max-h-[40vh] overflow-auto rounded bg-muted p-3 text-xs whitespace-pre-wrap">
      {text}
    </pre>
  )
}

function KVTable({ data }: { data: Record<string, any> }) {
  const entries = Object.entries(data || {})
  if (!entries.length) return <div className="text-sm text-muted-foreground">-</div>
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-48">Key</TableHead>
          <TableHead>Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map(([k, v]) => (
          <TableRow key={k}>
            <TableCell className="font-medium">{k}</TableCell>
            <TableCell>
              {v !== null && typeof v === "object" ? (
                <JSONBlock value={v} />
              ) : (
                <span className="font-mono text-xs break-words">{String(v)}</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function AuditLogViewer({ log }: { log: any }) {
  // persisted collapsible state
  const storageKey = useMemo(() => `audit-viewer-open-${log?.id ?? "unknown"}`, [log?.id])
  const [openSummary, setOpenSummary] = useState(true)
  const [openOld, setOpenOld] = useState(true)
  const [openNew, setOpenNew] = useState(true)
  const [openDiff, setOpenDiff] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const s = JSON.parse(raw)
        if (typeof s.summary === "boolean") setOpenSummary(s.summary)
        if (typeof s.old === "boolean") setOpenOld(s.old)
        if (typeof s.new === "boolean") setOpenNew(s.new)
        if (typeof s.diff === "boolean") setOpenDiff(s.diff)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        summary: openSummary,
        old: openOld,
        new: openNew,
        diff: openDiff,
      }))
    } catch {}
  }, [storageKey, openSummary, openOld, openNew, openDiff])

  const expandAll = () => { setOpenSummary(true); setOpenOld(true); setOpenNew(true); setOpenDiff(true) }
  const collapseAll = () => { setOpenSummary(false); setOpenOld(false); setOpenNew(false); setOpenDiff(false) }

  const meta: Record<string, any> = useMemo(() => {
    const base: Record<string, any> = {
      id: log?.id,
      time: log?.createdAt ? new Date(log.createdAt).toLocaleString() : "-",
      action: log?.action,
      entityType: log?.entityType,
      entityId: log?.entityId,
      user: log?.user?.name || log?.userEmail || "-",
      userEmail: log?.user?.email || "",
      ipAddress: log?.ipAddress || log?.newValue?.ip || "-",
      userAgent: log?.userAgent || log?.newValue?.userAgent || "-",
    }
    const isSearch = log?.entityType === "search" || log?.action === "search_event"
    if (isSearch && log?.newValue && typeof log.newValue === "object") {
      const nv = log.newValue as Record<string, any>
      base.query = nv.query
      base.resultCount = nv.resultCount
      base.aiSuggested = nv.aiSuggested
      base.clickedSuggestion = nv.clickedSuggestion
      base.source = nv.source
      base.timestamp = nv.ts
    }
    return base
  }, [log])

  const oldObj = (log?.oldValue && typeof log.oldValue === "object") ? log.oldValue as Record<string, any> : null
  const newObj = (log?.newValue && typeof log.newValue === "object") ? log.newValue as Record<string, any> : null

  const diffRows = useMemo(() => {
    if (!oldObj || !newObj) return [] as Array<{ key: string; oldVal: any; newVal: any; changed: boolean }>
    const keys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)])).sort()
    return keys.map((k) => {
      const oldVal = oldObj[k]
      const newVal = newObj[k]
      const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal)
      return { key: k, oldVal, newVal, changed }
    })
  }, [oldObj, newObj])

  const copy = async (label: string, value: any) => {
    try {
      const text = typeof value === "string" ? value : JSON.stringify(value, null, 2)
      await navigator.clipboard.writeText(text)
    } catch {
      // no-op
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">View</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Log • {log?.action} {log?.entityType ? `• ${log.entityType}` : ""}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={expandAll}>Expand all</Button>
            <Button size="sm" variant="ghost" onClick={collapseAll}>Collapse all</Button>
          </div>

          <Collapsible open={openSummary} onOpenChange={setOpenSummary}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Summary</div>
              <CollapsibleTrigger asChild>
                <Button size="sm" variant="ghost">Toggle</Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-2">
              <KVTable data={meta} />
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => copy("ID", log?.id)}>Copy ID</Button>
                {log?.oldValue && (
                  <Button size="sm" variant="outline" onClick={() => copy("Old", log.oldValue)}>Copy Old JSON</Button>
                )}
                {log?.newValue && (
                  <Button size="sm" variant="outline" onClick={() => copy("New", log.newValue)}>Copy New JSON</Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {log?.oldValue ? (
            <Collapsible open={openOld} onOpenChange={setOpenOld}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Old Value</div>
                <CollapsibleTrigger asChild>
                  <Button size="sm" variant="ghost">Toggle</Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-2">
                {typeof log.oldValue === "object" ? <KVTable data={log.oldValue} /> : <JSONBlock value={log.oldValue} />}
              </CollapsibleContent>
            </Collapsible>
          ) : null}

          {log?.newValue ? (
            <Collapsible open={openNew} onOpenChange={setOpenNew}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">New Value</div>
                <CollapsibleTrigger asChild>
                  <Button size="sm" variant="ghost">Toggle</Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-2">
                {typeof log.newValue === "object" ? <KVTable data={log.newValue} /> : <JSONBlock value={log.newValue} />}
              </CollapsibleContent>
            </Collapsible>
          ) : null}

          {diffRows.length ? (
            <Collapsible open={openDiff} onOpenChange={setOpenDiff}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Diff (Old → New)</div>
                <CollapsibleTrigger asChild>
                  <Button size="sm" variant="ghost">Toggle</Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Key</TableHead>
                      <TableHead className="w-1/2">Old</TableHead>
                      <TableHead>New</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diffRows.map(({ key, oldVal, newVal, changed }) => (
                      <TableRow key={key} className={changed ? "bg-amber-50 dark:bg-amber-950/20" : undefined}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>
                          {oldVal !== null && typeof oldVal === "object" ? (
                            <JSONBlock value={oldVal} />
                          ) : (
                            <span className="font-mono text-xs break-words">{String(oldVal)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {newVal !== null && typeof newVal === "object" ? (
                            <JSONBlock value={newVal} />
                          ) : (
                            <span className="font-mono text-xs break-words">{String(newVal)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copy(key, { key, old: oldVal, new: newVal })}
                          >
                            Copy
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </Collapsible>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
