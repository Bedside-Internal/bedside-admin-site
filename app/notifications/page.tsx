"use client";

import AdminGate from "@/components/layout/AdminGate";
import NotificationsContent from "@/components/notifications/NotificationsContent";

export default function NotificationsPage() {
    return <AdminGate resource="notifications" deniedMessage="You do not have permission to view notifications.">
        {({ can, adminId }) => <NotificationsContent key={adminId} can={can} />}
    </AdminGate>;
}
