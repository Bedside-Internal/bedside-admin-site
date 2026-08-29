import { Mail, Link2 } from "lucide-react";
import type { SocialPlatform } from "@/types/marketing";

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
);

const YoutubeIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15V9l5.2 3-5.2 3Z" />
    </svg>
);

const LinkedinIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3zm7 0h3.8v1.7h.1c.5-1 1.9-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4z" />
    </svg>
);

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3.1h2.8v8h2.7Z" />
    </svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M18.3 2H21l-6.6 7.5L22 22h-6.1l-4.8-6.3L5.6 22H3l7.1-8.1L2.5 2h6.2l4.3 5.8L18.3 2Zm-1.1 18h1.7L7 3.9H5.2L17.2 20Z" />
    </svg>
);

const DiscordIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M20.3 4.4A19.6 19.6 0 0 0 15.6 3c-.2.4-.5.9-.7 1.3a18 18 0 0 0-5.8 0A9 9 0 0 0 8.4 3c-1.6.3-3.2.8-4.7 1.4C1 9.1.3 13.7.6 18.2a19.7 19.7 0 0 0 6 3c.5-.7.9-1.4 1.2-2.2-.7-.2-1.3-.5-1.9-.9l.5-.4c3.6 1.7 7.5 1.7 11.1 0l.5.4c-.6.4-1.3.7-1.9.9.3.8.7 1.5 1.2 2.2a19.6 19.6 0 0 0 6-3c.4-5.2-1-9.7-3.9-13.8ZM9 15.3c-1.1 0-2-1-2-2.3 0-1.2.9-2.3 2-2.3s2 1 2 2.3c0 1.2-.9 2.3-2 2.3Zm6.1 0c-1.1 0-2-1-2-2.3 0-1.2.9-2.3 2-2.3s2 1 2 2.3c0 1.2-.9 2.3-2 2.3Z" />
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M16.6 2h-3.2v13.4a2.9 2.9 0 1 1-2.1-2.8V9.4a6.1 6.1 0 1 0 5.3 6V8.7a8.3 8.3 0 0 0 4.8 1.5V7a5 5 0 0 1-4.8-5Z" />
    </svg>
);

const iconMap: Record<SocialPlatform, React.ComponentType> = {
    instagram: InstagramIcon,
    x: XIcon,
    discord: DiscordIcon,
    tiktok: TikTokIcon,
    youtube: YoutubeIcon,
    linkedin: LinkedinIcon,
    facebook: FacebookIcon,
    mail: () => <Mail size={18} strokeWidth={2} />,
    custom: () => <Link2 size={18} strokeWidth={2} />,
};

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
    instagram: "Instagram",
    x: "X (Twitter)",
    discord: "Discord",
    tiktok: "TikTok",
    youtube: "YouTube",
    linkedin: "LinkedIn",
    facebook: "Facebook",
    mail: "Email",
    custom: "Custom",
};

export function SocialIcon({ platform }: { platform: SocialPlatform }) {
    const Icon = iconMap[platform] ?? Link2;
    return <Icon />;
}