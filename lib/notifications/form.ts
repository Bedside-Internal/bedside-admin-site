import type { CreateNotificationInput, NotificationRecipient } from "../../types/notifications.ts";

export interface NotificationFormValues {
    title: string;
    body: string;
    linkLabel: string;
    linkHref: string;
    audienceType: "all" | "user";
    targetUser: NotificationRecipient | null;
    expiresAt: string;
}

export function safeNotificationHref(href: string): boolean {
    if (/[\u0000-\u0020\u007f\\]/.test(href)) return false;
    if (href.startsWith("/") && !href.startsWith("//")) return true;
    try {
        const url = new URL(href);
        return /^https:\/\//i.test(href) && url.protocol === "https:" && !url.username && !url.password;
    } catch { return false; }
}

export function validateNotification(values: NotificationFormValues, now = Date.now()): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!values.title.trim() || values.title.trim().length > 255) errors["content.title"] = "Enter a title of 1–255 characters.";
    if (!values.body.trim() || values.body.trim().length > 1000) errors["content.body"] = "Enter a body of 1–1000 characters.";
    const label = values.linkLabel.trim(), href = values.linkHref.trim();
    if (label || href) {
        if (!label || label.length > 255) errors["content.cta.label"] = "Enter a link label of 1–255 characters.";
        if (!href || href.length > 2048 || !safeNotificationHref(href)) errors["content.cta.href"] = "Use an application path starting with / or an HTTPS URL.";
    }
    if (values.audienceType === "user" && !values.targetUser) errors.targetUserId = "Choose a user from the search results.";
    if (values.expiresAt && (!Number.isFinite(Date.parse(values.expiresAt)) || Date.parse(values.expiresAt) <= now)) errors.expiresAt = "Choose an expiry in the future.";
    return errors;
}

export function notificationInput(values: NotificationFormValues): CreateNotificationInput {
    const label = values.linkLabel.trim();
    return {
        category: values.audienceType === "all" ? "announcement" : "message",
        audienceType: values.audienceType,
        ...(values.audienceType === "user" && values.targetUser ? { targetUserId: values.targetUser.id } : {}),
        content: { title: values.title.trim(), body: values.body.trim(), ...(label ? { cta: { label, href: values.linkHref.trim() } } : {}) },
        ...(values.expiresAt ? { expiresAt: new Date(values.expiresAt).toISOString() } : {}),
    };
}

export function userLabel(user: NotificationRecipient): string {
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || user.id;
}
