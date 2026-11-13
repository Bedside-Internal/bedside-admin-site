import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminNotification } from "@/types/notifications";

export default function SentNotifications({ items, loading, error, canWrite, pendingActionId, onArchive, page, requestedPage, failedPage, onPageChange, onRetry }: {
    page: number; requestedPage: number; failedPage: number | null; onPageChange: (direction: -1 | 1) => void; onRetry: () => void;
    items: AdminNotification[]; loading: boolean; error?: string | null; canWrite: boolean; pendingActionId: string | null; onArchive: (id: string) => Promise<void>;
}) {
    return <section aria-labelledby="sent-notifications-heading" aria-busy={loading} className="mt-8 rounded-xl border border-ink/10 bg-white">
        <h2 id="sent-notifications-heading" className="border-b border-ink/10 px-5 py-4 text-lg font-semibold">Sent notifications</h2>
        {loading && <p role="status" className="px-5 py-3 text-sm text-ink/60">Loading notification page {requestedPage}…</p>}
        {items.length === 0 ? <p className="p-6 text-sm text-ink/60">{loading ? "Loading notifications…" : error ? "The sent list is unavailable. Try again." : "No notifications on this page. You can go back or check the next page."}</p>
            : <div className="overflow-x-auto"><table className="w-full min-w-[48rem] text-left text-sm">
                <caption className="sr-only">Sent notifications and engagement counts</caption>
                <thead className="bg-sand/40 text-xs text-ink/60"><tr>
                    {['Title', 'Audience', 'Sent', 'Status', 'Read', 'Dismissed', 'Action'].map((label) => <th key={label} scope="col" className="px-4 py-3 font-medium">{label}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-ink/10">{items.map((item) => <tr key={item.id}>
                    <th scope="row" className="max-w-64 break-words px-4 py-4 font-medium">{item.content.title}</th>
                    <td className="px-4 py-4"><span>{item.audienceType === "all" ? "Everyone" : item.audienceType === "user" ? "One user" : item.audienceType}</span>{item.targetUserId && <span className="mt-1 block max-w-48 break-all text-xs text-ink/60">{item.targetUserId}</span>}</td>
                    <td className="whitespace-nowrap px-4 py-4"><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs capitalize ${item.status === "archived" ? "bg-sand text-ink/70" : "bg-mint/15 text-ink"}`}>{item.status}</span></td>
                    <td className="px-4 py-4 tabular-nums">{item.readCount}</td><td className="px-4 py-4 tabular-nums">{item.dismissCount}</td>
                    <td className="px-4 py-4">{canWrite && <button type="button" aria-label={`Archive ${item.content.title}`} disabled={loading || pendingActionId !== null || item.status === "archived"} onClick={() => void onArchive(item.id)} className="rounded-md border border-ink/15 px-3 py-1.5 text-xs hover:bg-sand disabled:opacity-40">{pendingActionId === item.id ? "Archiving…" : item.status === "archived" ? "Archived" : "Archive"}</button>}</td>
                </tr>)}</tbody>
            </table></div>}
        <nav aria-label="Notification pages" className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-5 py-3">
            <button type="button" onClick={() => onPageChange(-1)} disabled={requestedPage === 1 || pendingActionId !== null} className="flex items-center gap-1 rounded-md border border-ink/15 px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft aria-hidden="true" className="h-3.5 w-3.5" />Previous</button>
            <span aria-live="polite" className="text-sm text-ink/50">Page {page}</span>
            {failedPage !== null && <button type="button" onClick={onRetry} disabled={loading || pendingActionId !== null} className="rounded-md border border-ink/15 px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-sand disabled:opacity-40">Retry page {failedPage}</button>}
            <button type="button" onClick={() => onPageChange(1)} disabled={pendingActionId !== null} className="flex items-center gap-1 rounded-md border border-ink/15 px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight aria-hidden="true" className="h-3.5 w-3.5" /></button>
        </nav>
    </section>;
}
