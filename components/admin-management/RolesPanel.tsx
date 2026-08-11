interface RolesPanelProps {
    canWrite: boolean;
    canDelete: boolean;
  }
  
  export default function RolesPanel({ canWrite, canDelete }: RolesPanelProps) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-ink/10 p-5">
          <div>
            <h2 className="font-poppins text-base font-bold text-ink">Roles</h2>
            <p className="mt-0.5 text-xs text-ink/40">Define permission templates</p>
          </div>
          {canWrite && (
            <button className="rounded-lg border border-violet/30 px-3 py-1.5 text-xs font-medium text-violet transition hover:bg-violet/10">
              Create Role
            </button>
          )}
        </div>
  
        {/* List Area (Empty State for now) */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet/10">
              <svg className="h-5 w-5 text-violet" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-ink/70">No roles configured</p>
            <p className="mt-1 text-xs text-ink/40">Create a role to define resource permissions.</p>
          </div>
        </div>
      </div>
    );
  }