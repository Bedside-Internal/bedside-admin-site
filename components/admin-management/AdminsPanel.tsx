interface AdminsPanelProps {
    canWrite: boolean;
    canDelete: boolean;
  }
  
  export default function AdminsPanel({ canWrite, canDelete }: AdminsPanelProps) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-ink/10 bg-white">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-ink/10 p-5">
          <div>
            <h2 className="font-poppins text-base font-bold text-ink">Admin Users</h2>
            <p className="mt-0.5 text-xs text-ink/40">Assign roles and manage access</p>
          </div>
          {canWrite && (
            <button className="rounded-lg border border-violet/30 px-3 py-1.5 text-xs font-medium text-violet transition hover:bg-violet/10">
              Grant Access
            </button>
          )}
        </div>
  
        {/* List Area (Empty State for now) */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet/10">
              <svg className="h-5 w-5 text-violet" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-ink/70">No admin users</p>
            <p className="mt-1 text-xs text-ink/40">Grant console access to a user to get started.</p>
          </div>
        </div>
      </div>
    );
  }