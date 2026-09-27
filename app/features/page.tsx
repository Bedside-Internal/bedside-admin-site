"use client";

import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import AdminGate from "@/components/layout/AdminGate";
import AdminNav from "@/components/layout/AdminNav";
import FeaturesContent from "@/components/features/FeaturesContent";

type Can = ReturnType<typeof useAdminPermissions>["can"];

function FeaturesPageContent({ can }: { can: Can }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream font-dm text-ink">
      <AdminNav />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-poppins text-2xl font-bold text-ink">
                  Feature Flags / Onboarding Content
                </h1>
                <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-mint">
                  FEATURES
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/50">
                Manage tracks, formats, and their availability in the onboarding
                flow.
              </p>
            </div>
          </div>

          <FeaturesContent
            canWrite={can("feature_flags", "write")}
            canDelete={can("feature_flags", "delete")}
          />
        </div>
      </main>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <AdminGate
      resource="feature_flags"
      deniedMessage="You do not have permission to view feature flags."
    >
      {({ can }) => <FeaturesPageContent can={can} />}
    </AdminGate>
  );
}