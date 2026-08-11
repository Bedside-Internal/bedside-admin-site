import { User, UserTier } from "@/types/user";

interface UserTableProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (id: string) => void;
}

function TierBadge({ tier }: { tier: UserTier }) {
  const styles: Record<UserTier, string> = {
    paid: "bg-amber/15 text-ink",
    free: "bg-sand text-ink/60",
    admin: "bg-mint/15 text-ink",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[tier]}`}
    >
      {tier}
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UserTable({
  users,
  selectedUserId,
  onSelectUser,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-ink/40">
        No users found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-xs font-medium uppercase tracking-wide text-ink/40">
            <th className="pb-3 pr-4 pl-6">Email</th>
            <th className="pb-3 pr-4">First Name</th>
            <th className="pb-3 pr-4">Tier</th>
            <th className="pb-3 pr-4">Paid Until</th>
            <th className="pb-3 pr-4">Attempts Used</th>
            <th className="pb-3 pr-4">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelected = user.id === selectedUserId;
            return (
              <tr
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className={`cursor-pointer border-b border-ink/5 transition-colors ${
                  isSelected
                    ? "bg-mint/8"
                    : "hover:bg-sand/60"
                }`}
              >
                <td className="py-3 pr-4 pl-6 font-medium text-ink">
                  {user.email}
                </td>
                <td className="py-3 pr-4 text-ink/70">{user.firstName}</td>
                <td className="py-3 pr-4">
                  <TierBadge tier={user.tier} />
                </td>
                <td className="py-3 pr-4 text-ink/50">
                  {formatDate(user.paidUntil)}
                </td>
                <td className="py-3 pr-4 tabular-nums text-ink/70">
                  {user.attemptsUsed}/{user.attemptsLimit}
                </td>
                <td className="py-3 pr-4 text-ink/50">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}