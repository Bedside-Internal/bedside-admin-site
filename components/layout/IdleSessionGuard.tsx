"use client";

import { useIdleLogout } from "@/hooks/useIdleLogout";

export default function IdleSessionGuard({
    idleMinutes = 15,
    warnMinutes = 1,
}: {
    idleMinutes?: number;
    warnMinutes?: number;
}) {
    const { showWarning, staySignedIn, signOutNow } = useIdleLogout({ idleMinutes, warnMinutes });

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4">
            <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-cream p-6 text-center shadow-xl">
                <h2 className="font-poppins text-xl font-bold text-ink">Still there?</h2>
                <p className="mt-2 text-sm text-ink/60">
                    You&apos;ll be signed out in about a minute due to inactivity, to keep this console secure.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={signOutNow}
                        className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-medium text-ink hover:bg-sand"
                    >
                        Sign out now
                    </button>
                    <button
                        type="button"
                        onClick={staySignedIn}
                        className="rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-cream hover:bg-mint-hover"
                    >
                        Stay signed in
                    </button>
                </div>
            </div>
        </div>
    );
}