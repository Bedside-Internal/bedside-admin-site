import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen w-full bg-cream">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="relative hidden w-full max-w-md flex-col justify-between overflow-hidden bg-sand px-10 py-10 lg:flex">
        <svg
          className="pointer-events-none absolute -bottom-48 -right-32 h-[500px] w-[500px]"
          viewBox="0 0 500 500"
          fill="none"
        >
          <circle cx="250" cy="250" r="230" stroke="var(--color-ink)" strokeOpacity="0.06" />
          <circle cx="250" cy="250" r="160" stroke="var(--color-ink)" strokeOpacity="0.05" />
          <circle cx="250" cy="250" r="95" fill="var(--color-mint)" fillOpacity="0.08" />
        </svg>

        <span className="text-sm font-medium text-ink/40">Admin Portal</span>

        <div className="relative z-10 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-mint">
            Welcome back
          </p>
          <h1 className="font-poppins text-4xl font-bold leading-tight text-ink">
            Bedside
            <br />
            Admin.
          </h1>
          <p className="max-w-xs text-sm text-ink/50">
            Manage users, review support requests, and oversee platform health.
          </p>
        </div>

        <p className="relative z-10 text-xs text-ink/30">
          Authorized personnel only.
        </p>
      </div>

      {/* Right Panel - Clerk Form */}
      <div className="relative flex flex-1 items-center justify-center bg-cream px-4 py-12">
        <div className="w-full max-w-sm">
          <SignIn
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-cream border border-ink/10 rounded-2xl p-6",
                headerTitle: "font-poppins text-2xl font-bold text-ink",
                headerSubtitle: "text-ink/50 text-sm",
                socialButtonsBlockButton:
                  "border-ink/10 rounded-xl py-3 hover:bg-sand/60 text-ink",
                dividerLine: "bg-ink/10",
                dividerText: "text-ink/40",
                formFieldLabel: "text-ink/70 font-medium text-xs",
                formFieldInput:
                  "rounded-xl border-ink/10 bg-sand/40 py-3 text-ink focus:border-mint focus:ring-mint/30",
                footerActionLink: "text-mint hover:text-mint-hover",
                formButtonPrimary:
                  "bg-mint hover:bg-mint-hover rounded-xl py-3 text-sm font-semibold normal-case text-cream shadow-none",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}