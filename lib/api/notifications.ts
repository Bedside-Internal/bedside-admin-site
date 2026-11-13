import { handleResponse } from "./http";
import type { AdminNotification, CreateNotificationInput, NotificationRecipientsResponse } from "@/types/notifications";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");

async function request(token: string | null, path = "", input?: CreateNotificationInput, method = "GET") {
    const response = await fetch(`${API_BASE_URL}/api/admin/notifications${path}`, {
        method,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        cache: "no-store",
        ...(input ? { body: JSON.stringify(input) } : {}),
    });
    return response;
}

export async function listNotifications(token: string | null, page = 1, limit = 20): Promise<AdminNotification[]> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return handleResponse<AdminNotification[]>(await request(token, `?${params}`));
}

export async function createNotification(token: string | null, input: CreateNotificationInput): Promise<AdminNotification> {
    return handleResponse<AdminNotification>(await request(token, "", input, "POST"));
}

export async function archiveNotification(token: string | null, id: string): Promise<AdminNotification> {
    return handleResponse<AdminNotification>(await request(token, `/${encodeURIComponent(id)}/archive`, undefined, "POST"));
}

export async function searchNotificationRecipients(token: string | null, search: string, page = 1, limit = 20): Promise<NotificationRecipientsResponse> {
    const params = new URLSearchParams({ search: search.trim(), page: String(page), limit: String(limit) });
    return handleResponse<NotificationRecipientsResponse>(await request(token, `/recipients?${params}`));
}
