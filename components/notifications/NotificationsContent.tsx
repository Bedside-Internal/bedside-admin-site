"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import AdminNav from "@/components/layout/AdminNav";
import { FieldError, FormErrorBanner, inputBorder } from "@/components/forms/FormErrors";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { useNotifications } from "@/hooks/useNotifications";
import { notificationInput, validateNotification, userLabel, type NotificationFormValues } from "@/lib/notifications/form";
import type { CreateNotificationInput } from "@/types/notifications";
import type { AdminAction, AdminResource } from "@/types/admin";
import NotificationUserPicker from "./NotificationUserPicker";
import SentNotifications from "./SentNotifications";

const FIELDS = { content: "Content", "content.title": "Title", "content.body": "Body", "content.cta.label": "Link label", "content.cta.href": "Link URL", targetUserId: "Recipient", expiresAt: "Expiry" };
const EMPTY_FORM: NotificationFormValues = { title: "", body: "", linkLabel: "", linkHref: "", audienceType: "all", targetUser: null, expiresAt: "" };

function BroadcastConfirmation({ onCancel, onConfirm, trigger }: { onCancel: () => void; onConfirm: () => void; trigger: RefObject<HTMLButtonElement | null> }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const heading = useId();
    const description = useId();
    useEffect(() => {
        const element = dialog.current, button = trigger.current;
        element?.showModal();
        return () => { element?.close(); if (button?.isConnected) button.focus(); };
    }, [trigger]);
    return <dialog ref={dialog} aria-labelledby={heading} aria-describedby={description} onCancel={(event) => { event.preventDefault(); onCancel(); }}
        onClick={(event) => { if (event.currentTarget === event.target) onCancel(); }}
        onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button");
            const first = buttons[0], last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md rounded-xl border border-ink/10 bg-white p-6 text-ink shadow-xl backdrop:bg-black/35">
        <h2 id={heading} className="text-lg font-semibold">Send to everyone?</h2>
        <p id={description} className="mt-3 text-sm leading-relaxed text-ink/70">This notification will be published immediately for everyone in the current environment. Sending it cannot be undone.</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" autoFocus onClick={onCancel} className="rounded-md border border-ink/15 px-4 py-2 text-sm">Cancel</button>
            <button type="button" onClick={onConfirm} className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-ink hover:bg-mint-hover">Send to everyone</button>
        </div>
    </dialog>;
}

export default function NotificationsContent({ can }: { can: (resource: AdminResource, action: AdminAction) => boolean }) {
    const canWrite = can("notifications", "write");
    const notifications = useNotifications(canWrite);
    const form = useFormSubmit(FIELDS);
    const [values, setValues] = useState<NotificationFormValues>(EMPTY_FORM);
    const [confirmation, setConfirmation] = useState<CreateNotificationInput | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const submit = useRef<HTMLButtonElement>(null);
    const busy = useRef(false);
    const sending = form.submitting || notifications.pendingActionId !== null || notifications.loading;

    function change<K extends keyof NotificationFormValues>(key: K, value: NotificationFormValues[K], field = key as string) {
        setValues((previous) => ({ ...previous, [key]: value }));
        form.clearField(field); setSuccess(null);
    }

    async function send(input: CreateNotificationInput) {
        if (busy.current || !canWrite) return;
        busy.current = true;
        const recipient = input.audienceType === "all" ? "everyone" : values.targetUser ? userLabel(values.targetUser) : "the selected user";
        try {
            const ok = await form.run(() => notifications.create(input));
            if (ok) { setValues(EMPTY_FORM); setSuccess(`Notification sent to ${recipient}.`); }
        } finally { busy.current = false; }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy.current || sending || !canWrite) return;
        const problems = validateNotification(values);
        if (form.check(problems)) return;
        const input = notificationInput(values);
        if (input.audienceType === "all") setConfirmation(input);
        else void send(input);
    }

    const inputClass = (field: string) => `w-full rounded-md border bg-white px-3 py-2 text-sm font-dm text-ink outline-none transition-colors ${inputBorder(!!form.fieldError(field))}`;
    return <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
        <AdminNav />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
            <h1 className="mb-6 font-poppins text-2xl font-bold">Notifications</h1>
            {canWrite ? <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-ink/10 bg-white p-5 sm:p-7">
                <h2 className="mb-5 text-lg font-semibold">Compose notification</h2>
                <fieldset disabled={sending} className="min-w-0 space-y-4 disabled:opacity-60">
                    <div><label htmlFor="notification-title" className="mb-1.5 block text-[13px] font-medium">Title</label>
                        <input id="notification-title" value={values.title} maxLength={255} required aria-invalid={!!form.fieldError("content.title")} onChange={(event) => change("title", event.target.value, "content.title")} className={inputClass("content.title")} />
                        <FieldError message={form.fieldError("content.title")} /></div>
                    <div><label htmlFor="notification-body" className="mb-1.5 block text-[13px] font-medium">Body</label>
                        <textarea id="notification-body" rows={5} value={values.body} maxLength={1000} required aria-invalid={!!form.fieldError("content.body")} aria-describedby="notification-markdown" onChange={(event) => change("body", event.target.value, "content.body")} className={inputClass("content.body")} />
                        <p id="notification-markdown" className="mt-1 text-xs text-ink/60">Markdown is supported. Links must use an application path or HTTPS.</p>
                        <FieldError message={form.fieldError("content.body")} /></div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><label htmlFor="notification-link-label" className="mb-1.5 block text-[13px] font-medium">Link label (optional)</label><input id="notification-link-label" value={values.linkLabel} maxLength={255} aria-invalid={!!form.fieldError("content.cta.label")} onChange={(event) => change("linkLabel", event.target.value, "content.cta.label")} className={inputClass("content.cta.label")} /><FieldError message={form.fieldError("content.cta.label")} /></div>
                        <div><label htmlFor="notification-link-url" className="mb-1.5 block text-[13px] font-medium">Link URL (optional)</label><input id="notification-link-url" type="text" inputMode="url" value={values.linkHref} maxLength={2048} placeholder="/dashboard or https://…" aria-invalid={!!form.fieldError("content.cta.href")} onChange={(event) => change("linkHref", event.target.value, "content.cta.href")} className={inputClass("content.cta.href")} /><FieldError message={form.fieldError("content.cta.href")} /></div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><label htmlFor="notification-audience" className="mb-1.5 block text-[13px] font-medium">Audience</label><select id="notification-audience" value={values.audienceType} onChange={(event) => { change("audienceType", event.target.value === "user" ? "user" : "all"); change("targetUser", null, "targetUserId"); }} className={inputClass("targetUserId")}><option value="all">Everyone</option><option value="user">One user</option></select></div>
                        <div><label htmlFor="notification-expiry" className="mb-1.5 block text-[13px] font-medium">Expiry (optional, local time)</label><input id="notification-expiry" type="datetime-local" value={values.expiresAt} aria-invalid={!!form.fieldError("expiresAt")} onChange={(event) => change("expiresAt", event.target.value)} className={inputClass("expiresAt")} /><FieldError message={form.fieldError("expiresAt")} /></div>
                    </div>
                    {values.audienceType === "user" && <NotificationUserPicker value={values.targetUser} onChange={(user) => change("targetUser", user, "targetUserId")} disabled={sending} />}
                    <FieldError message={form.fieldError("targetUserId")} />
                </fieldset>
                <FormErrorBanner message={form.bannerMessage} />
                <div className="mt-6 flex flex-wrap items-center gap-4"><button ref={submit} type="submit" disabled={sending} className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-ink hover:bg-mint-hover disabled:opacity-40">{form.submitting ? "Sending…" : "Send notification"}</button><p className="text-xs text-ink/60">Publishes immediately. Leave expiry blank for no end date.</p></div>
            </form> : <p className="rounded-lg border border-ink/10 bg-white p-4 text-sm text-ink/60">You have read-only access to notifications.</p>}
            {success && <p role="status" className="mt-4 rounded-lg border border-mint/30 bg-mint/10 p-3 text-sm">{success}</p>}
            {notifications.error && <p role="alert" className="mt-4 rounded-lg border border-coral/30 bg-coral/10 p-3 text-sm text-coral">{notifications.error}</p>}
            <SentNotifications page={notifications.page} requestedPage={notifications.requestedPage} failedPage={notifications.failedPage} onPageChange={notifications.changePage} onRetry={notifications.retry} items={notifications.items} loading={notifications.loading} error={notifications.error} canWrite={canWrite} pendingActionId={notifications.pendingActionId} onArchive={notifications.archive} />
        </main>
        {confirmation && <BroadcastConfirmation trigger={submit} onCancel={() => setConfirmation(null)} onConfirm={() => { const input = confirmation; setConfirmation(null); void send(input); }} />}
    </div>;
}
