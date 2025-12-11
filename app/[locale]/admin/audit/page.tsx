import React from "react"
import Link from "next/link"
import { headers, cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AuditLogViewer from "@/components/admin/audit-log-viewer"
import AuditFilterState from "@/components/admin/audit-filter-state"

function q(obj: Record<string, any>) {
  const sp = new URLSearchParams()
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) sp.set(k, String(v))
  })
  return sp.toString()
}

async function getAudit(params: Record<string, any>) {
  const qs = q(params)
  // Build absolute same-origin URL for Node fetch and forward cookies for Clerk/middleware
  const h = await headers()
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000"
  const proto = h.get("x-forwarded-proto") || "http"
  const base = `${proto}://${host}`
  const cookieHeader = (await cookies()).toString()
  const res = await fetch(`${base}/api/admin/audit${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  })
  if (!res.ok) {
    let body: any = null
    try { body = await res.json() } catch {}
    return { error: body?.error || `Request failed (${res.status})` }
  }
  return res.json()
}

export default async function AuditPage(props: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page ?? 1)
  const limit = Number(searchParams?.limit ?? 50)
  const entityType = searchParams?.entityType ?? ""
  const action = searchParams?.action ?? ""
  const startDate = searchParams?.startDate ?? ""
  const endDate = searchParams?.endDate ?? ""
  const qText = searchParams?.q ?? ""
  const sort = searchParams?.sort ?? "createdAt"
  const order = searchParams?.order ?? "desc"

  const resp = await getAudit({ page, limit, entityType, action, startDate, endDate, q: qText, sort, order })
  const error = (resp as any)?.error as string | undefined
  const data = (resp as any)?.data ?? {}
  const { logs = [], pagination } = data

  return (
    <div className="p-6 space-y-6 overflow-x-hidden max-w-full">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Track system and admin activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link href="/admin/analytics/search">View Search Analytics</Link>
          </Button>
          <FilterForm initial={{ entityType, action, startDate, endDate, limit, q: qText, sort, order }} />
          <AuditFilterState />
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm">
          <div className="font-medium mb-1">Unable to load audit logs</div>
          <div className="text-muted-foreground">{error}</div>
        </div>
      ) : null}

      <div className="rounded-md border w-full overflow-hidden relative">
        <div className="w-full overflow-x-auto">
          <Table className="w-full table-fixed">
            <TableHeader className="sticky top-0 z-20 bg-background">
              <TableRow>
                <TableHead className="w-20 sticky left-0 z-30 bg-background border-r">Action</TableHead>
                <TableHead className="w-36 sticky top-0 bg-background">
                  <a className="underline" href={`?${q({ page, limit, entityType, action, startDate, endDate, q: qText, sort: 'createdAt', order: sort === 'createdAt' && order === 'asc' ? 'desc' : 'asc' })}`}>Time</a>
                </TableHead>
                <TableHead className="w-40 sticky top-0 bg-background">
                  <a className="underline" href={`?${q({ page, limit, entityType, action, startDate, endDate, q: qText, sort: 'action', order: sort === 'action' && order === 'asc' ? 'desc' : 'asc' })}`}>Event</a>
                </TableHead>
                <TableHead className="w-44 sticky top-0 bg-background">
                  <a className="underline" href={`?${q({ page, limit, entityType, action, startDate, endDate, q: qText, sort: 'entityType', order: sort === 'entityType' && order === 'asc' ? 'desc' : 'asc' })}`}>Entity</a>
                </TableHead>
                <TableHead className="w-48 sticky top-0 bg-background">
                  <a className="underline" href={`?${q({ page, limit, entityType, action, startDate, endDate, q: qText, sort: 'user', order: sort === 'user' && order === 'asc' ? 'desc' : 'asc' })}`}>User</a>
                </TableHead>
                <TableHead className="w-28 sticky top-0 bg-background">IP</TableHead>
                <TableHead className="w-56 sticky top-0 bg-background">User Agent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length ? logs.map((log: any) => (
                <TableRow key={log.id} className="align-top">
                  <TableCell className="sticky left-0 z-10 bg-background border-r">
                    <AuditLogViewer log={log} />
                  </TableCell>
                  <TableCell className="truncate" title={new Date(log.createdAt).toLocaleString()}>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="font-medium">{log.action}</div>
                    <div className="text-xs text-muted-foreground truncate" title={log.entityId}>{log.entityId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.entityType}</div>
                    <div className="text-xs text-muted-foreground truncate" title={log.entityName || log.entityId || "-"}>{log.entityName || log.entityId || "-"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.user?.name || log.userEmail || "-"}</div>
                    <div className="text-xs text-muted-foreground truncate" title={log.user?.email || ""}>{log.user?.email || ""}</div>
                  </TableCell>
                  <TableCell className="truncate" title={log.ipAddress || "-"}>{log.ipAddress || "-"}</TableCell>
                  <TableCell className="truncate" title={log.userAgent || ""}>{log.userAgent || ""}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No audit logs</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination pagination={pagination} currentQuery={{ entityType, action, startDate, endDate, limit, q: qText, sort, order }} />
    </div>
  )
}

function JsonPreview({ value }: { value: any }) {
  if (!value) return <span className="text-muted-foreground">-</span>
  try {
    const text = JSON.stringify(value)
    if (text.length <= 160) return <code className="text-xs break-words">{text}</code>
    return <code className="text-xs break-words" title={text}>{text.slice(0, 160)}…</code>
  } catch {
    return <span className="text-muted-foreground">(unserializable)</span>
  }
}

function Pagination({ pagination, currentQuery }: { pagination?: any; currentQuery: Record<string, any> }) {
  const page = Number(pagination?.page ?? 1)
  const pages = Number(pagination?.pages ?? 1)
  const prev = page > 1 ? page - 1 : 1
  const next = page < pages ? page + 1 : pages
  const baseQuery = { ...currentQuery, page: undefined }
  const total = Number(pagination?.total ?? 0)
  const limit = Number(currentQuery.limit ?? 50)
  const start = total === 0 ? 0 : (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between mt-2 text-sm">
      <div className="text-muted-foreground">{start}-{end} of {total} • Page {page} of {pages}</div>
      <div className="inline-flex gap-2">
        <a className="underline" href={`?${q({ ...baseQuery, page: prev })}`}>Prev</a>
        <a className="underline" href={`?${q({ ...baseQuery, page: next })}`}>Next</a>
      </div>
    </div>
  )
}

function FilterForm({ initial }: { initial: { entityType: string; action: string; startDate: string; endDate: string; limit: number; q: string; sort: string; order: string } }) {
  const { entityType, action, startDate, endDate, limit, q: qText, sort, order } = initial
  return (
    <form className="flex gap-2 items-end flex-wrap" action="/admin/audit" method="get">
      <input type="hidden" name="sort" value={sort} />
      <input type="hidden" name="order" value={order} />
      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground">Entity</label>
        <Input name="entityType" defaultValue={entityType} placeholder="search, product, order…" className="h-9" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground">Action</label>
        <Input name="action" defaultValue={action} placeholder="search_event, create…" className="h-9" />
      </div>
      <div className="flex flex-col min-w-[220px]">
        <label className="text-xs text-muted-foreground">Quick search</label>
        <Input name="q" defaultValue={qText} placeholder="entity id, user email, ip, ua…" className="h-9" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground">Start</label>
        <Input type="date" name="startDate" defaultValue={startDate} className="h-9" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-muted-foreground">End</label>
        <Input type="date" name="endDate" defaultValue={endDate} className="h-9" />
      </div>
      <div className="flex flex-col min-w-[110px]">
        <label className="text-xs text-muted-foreground">Limit</label>
        <Select name="limit" defaultValue={String(limit)}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            {[25, 50, 100, 200].map((n) => (
              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="h-9">Apply</Button>
      <Button asChild variant="outline" className="h-9">
        <a href={`/api/admin/audit/export?${q({ entityType, action, startDate, endDate, limit, q: qText, sort, order })}`} target="_blank" rel="noopener noreferrer">Export CSV</a>
      </Button>
    </form>
  )
}
