import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream font-dm">
      {/* Minimal branding */}
      <div className="mb-8 text-center">
        <h1 className="font-poppins text-2xl font-bold text-ink">
          Bedside Admin
        </h1>
        <p className="mt-1 text-sm text-ink/50">Internal dashboard</p>
      </div>

      {/* Clerk SignIn component */}
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
        <SignIn routing="hash" />
      </div>
    </div>
  );
}