interface UserSearchProps {
    value: string;
    onChange: (value: string) => void;
  }
  
  export default function UserSearch({ value, onChange }: UserSearchProps) {
    return (
      <div className="relative w-full max-w-md">
        {/* Search icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
  
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by email or clerkId"
          className="w-full rounded-lg border border-ink/10 bg-sand/60 py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink/40 transition focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/30"
        />
      </div>
    );
  }