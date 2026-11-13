export interface AdminNotification {
    id: string;
    category: "announcement" | "promo" | "message" | "nudge";
    content: { title: string; body: string; cta?: { label: string; href: string } };
    startsAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    audienceType: "all" | "segment" | "batch" | "user";
    targetUserId: string | null;
    status: "draft" | "scheduled" | "published" | "archived";
    createdBy: string | null;
    readCount: number;
    dismissCount: number;
}

export interface CreateNotificationInput {
    category: "announcement" | "promo" | "message";
    audienceType: "all" | "user";
    targetUserId?: string;
    content: AdminNotification["content"];
    expiresAt?: string | null;
}

export interface NotificationRecipient {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
}

export interface NotificationRecipientsResponse {
    users: NotificationRecipient[];
    total: number;
}
