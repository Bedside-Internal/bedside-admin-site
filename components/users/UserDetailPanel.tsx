import { useState, useEffect } from "react";
import { User, UserTier, UpdateUserPayload, GrantAttemptsPayload } from "@/types/user";

interface UserDetailPanelProps {
  user: User | null;
  onUpdate: (id: string, payload: UpdateUserPayload) => void;
  onGrant: (id: string, payload: GrantAttemptsPayload) => void;
}

function toDateString(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().split("T")[0];
}

export default function UserDetailPanel({
  user,
  onUpdate,
  onGrant,
}: UserDetailPanelProps) {
  const [tier, setTier] = useState<UserTier>("free");
  const [paidUntil, setPaidUntil] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  // Sync local state when a new user is selected
  useEffect(() => {
    if (user) {
      setTier(user.tier);
      setPaidUntil(toDateString(user.paidUntil));
      setAmount("");
      setReason("");
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return (
      <aside className="flex w-96 shrink-0 items-center justify-center border-l border-ink/10 bg-cream">
        <p className="text-sm text-ink/30">Select a user to view details</p>
      </aside>
    );
  }

  const handleSave = () => {
    onUpdate(user.id, {
      tier,
      paidUntil: paidUntil ? new Date(paidUntil).toISOString() : null,
    });
  };

  const handleGrant = () => {
    const parsed = parseInt(amount, 10);
    if (!parsed || parsed <= 0) return;
    onGrant(user.id, { amount: parsed, reason });
    setAmount("");
    setReason("");
  };

  return (
    <aside className="flex w-96 shrink-0 flex-col border-l border-ink/10 bg-cream overflow-y-auto">
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-mint">
            User Detail
          </p>
          <h2 className="truncate text-base font-semibold text-ink">
            {user.email}
          </h2>
          <p className="mt-0.5 truncate text-xs text-ink/40">
            {user.clerkId}
          </p>
        </div>

        {/* Edit Section */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/60">
              Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as UserTier)}
              className="w-full rounded-lg border border-ink/10 bg-sand/60 px-3 py-2 text-sm text-ink focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30"
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/60">
              Paid Until
            </label>
            <input
              type="date"
              value={paidUntil}
              onChange={(e) => setPaidUntil(e.target.value)}
              className="w-full rounded-lg border border-ink/10 bg-sand/60 px-3 py-2 text-sm text-ink focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full rounded-lg border border-mint py-2 text-sm font-medium text-mint transition hover:bg-mint/10"
          >
            Save changes
          </button>
        </div>

        {/* Divider */}
        <hr className="border-ink/10" />

        {/* Grant Attempts Section */}
        <div className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-mint">
            Grant Bonus Attempts
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/60">
              Amount
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5"
              className="w-full rounded-lg border border-ink/10 bg-sand/60 px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/60">
              Reason / Note
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Support compensation"
              className="w-full rounded-lg border border-ink/10 bg-sand/60 px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30"
            />
          </div>

          <button
            onClick={handleGrant}
            className="w-full rounded-lg bg-mint py-2.5 text-sm font-semibold text-cream transition hover:bg-mint-hover"
          >
            Grant attempts
          </button>
        </div>
      </div>
    </aside>
  );
}