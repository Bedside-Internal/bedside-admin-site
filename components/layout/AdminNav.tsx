import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Users", href: "/users" },
  { label: "Content", href: "/content" },
  { label: "Features", href: "/features" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-ink/10 bg-cream">
      <div className="mx-auto flex h-14 max-w-8xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="font-poppins text-lg font-bold text-ink">
            Bedside Admin
          </span>
          <span className="rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-ink/50">
            INTERNAL
          </span>
        </div>

        <ul className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={`relative px-3 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-mint"
                      : "text-ink/50 hover:text-ink"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-mint" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}