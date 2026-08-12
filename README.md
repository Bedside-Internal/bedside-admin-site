# Bedside Admin Site

Internal admin dashboard: content management (questions/sections/formats), feature flags (which tracks/formats are live), user lookup, and admin role/permission management. Next.js App Router + Tailwind, separate deploy from the main client.

## Stack
- **Framework**: Next.js (App Router), TypeScript
- **Auth**: Clerk (`@clerk/nextjs`), **deny-by-default** — `proxy.ts` protects everything except `/sign-in(.*)` and `/sign-up(.*)`, including `/` itself. This is intentionally the inverse of an allow-list, since an allow-list makes it easy to forget to protect a route.
- **Permissions**: layered on top of Clerk auth — `hooks/useAdminPermissions.ts` + server-side `requireAdmin`/`requirePermission` (in the server repo) gate what an authenticated admin can actually do, not just whether they're signed in.
- **API**: talks to the same `bedside-api-service` server as the client, via `lib/api/`

## Getting set up

1. **Install dependencies**
```bash
npm install
```

2. **Env vars -- refer to .env.example to get started**. You can also do the same steps as the client one to authenticate into the key management server to access the secrets for it to inject in runtime.

3. **Run dev server**
```bash
npm run dev
```
Currently just `next dev` — no Infisical wrapper (see above).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | `next build` |
| `npm start` | `next start` |
| `npm run lint` | ESLint |

## Folder structure

```
app/
├── admin-management/    # manage admin users, roles, permissions
├── content/               # question/section/format authoring (manual + AI-generated)
├── features/                # feature flags — which tracks/formats show as available
├── users/                     # user lookup/detail
└── sign-in/                     # Clerk catch-all

components/
├── admin-management/    # role/permission editing UI
├── content/                # content table, filters, question forms (manual + AI-assisted)
├── features/                  # feature row/section editing, icon picker
├── layout/                       # AdminNav
└── users/                          # user search, table, detail panel

hooks/useAdminPermissions.ts   # client-side permission checks, mirrors server-side requireAdmin logic
lib/api/                          # admin.ts, ai.ts, content.ts, users.ts — fetch wrappers per resource
```

## Things to know before you touch this

- **This app controls what's live in the main client app.** The `features` section here directly drives which tracks/formats show as selectable in onboarding (via the server's `/api/features` endpoint + Mongo `features` collection). Toggling something off here has an immediate effect on production users — treat changes here with the same care as a prod deploy.
- **Permission checks exist in two places**: `useAdminPermissions.ts` client-side (for UI — hiding buttons/sections a given admin shouldn't see) and `requireAdmin`/`requirePermission` server-side (the actual enforcement). The client-side check is UX only — never assume it's a security boundary; the server always re-checks.
- **Content authoring supports two paths**: write-your-own (`WriteQuestionForm.tsx`) and AI-generated-then-edit (`GenerateQuestionForm.tsx`, via `useAiGeneration.ts`). Both ultimately hit the same create/update endpoint on the server — they only differ in how the form gets pre-filled and in `source`/`aiModel` provenance fields.
- **Slightly looser typing here than the other two repos** — more `any` usage than client/server, mostly in `catch (err: any)` blocks and a few dynamic-key lookups (`(f as any)[k]`). Not urgent, but if you're touching one of those files anyway, tightening to `unknown`/proper generics is a quick win.
- **No automated tests**, same as the other two repos.

## Related docs (Notion)

- Onboarding (package auth, Infisical, service providers)
- Tech Debt