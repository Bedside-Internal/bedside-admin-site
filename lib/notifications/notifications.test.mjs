import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { registerHooks } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.startsWith("@/") || specifier.startsWith(".")) {
            const base = specifier.startsWith("@/") ? resolve(root, specifier.slice(2)) : resolve(dirname(fileURLToPath(context.parentURL)), specifier);
            const path = [base, `${base}.ts`, `${base}.tsx`].find(existsSync);
            if (path) return nextResolve(pathToFileURL(path).href, context);
        }
        return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
        if (url.endsWith(".ts") || url.endsWith(".tsx")) return { format: "module", shortCircuit: true, source: (url.endsWith(".tsx") ? 'import React from "react";\n' : "") + ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 } }).outputText };
        return nextLoad(url, context);
    },
});
const previousBase = process.env.NEXT_PUBLIC_API_URL;
process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";
const { listNotifications, createNotification, archiveNotification, searchNotificationRecipients } = await import("../api/notifications.ts");
if (previousBase === undefined) delete process.env.NEXT_PUBLIC_API_URL;
else process.env.NEXT_PUBLIC_API_URL = previousBase;
const { validateNotification, notificationInput, safeNotificationHref, userLabel } = await import("./form.ts");
const { default: SentNotifications } = await import("../../components/notifications/SentNotifications.tsx");
afterEach(() => mock.restoreAll());
const user = { id: "550e8400-e29b-41d4-a716-446655440001", firstName: "Alex", lastName: "Lee", email: "alex@example.test" };
const values = (override = {}) => ({ title: "Update", body: "**New** practice content", linkLabel: "", linkHref: "", audienceType: "all", targetUser: null, expiresAt: "", ...override });
const row = (override = {}) => ({ id: "550e8400-e29b-41d4-a716-446655440002", category: "announcement", content: { title: "Practice update", body: "News" }, startsAt: "2026-10-30T12:00:00Z", expiresAt: null, createdAt: "2026-10-30T12:00:00Z", audienceType: "all", targetUserId: null, status: "published", createdBy: user.id, readCount: 7, dismissCount: 2, ...override });

test("broadcast input publishes through the exact server contract with optional expiry omitted", () => {
    assert.deepEqual(validateNotification(values()), {});
    assert.deepEqual(notificationInput(values({ targetUser: user })), { category: "announcement", audienceType: "all", content: { title: "Update", body: "**New** practice content" } });
});
test("private input uses the selected internal UUID, not the search query or Clerk ID", () => {
    const input = values({ audienceType: "user", targetUser: user });
    assert.deepEqual(validateNotification(input), {});
    assert.equal(notificationInput(input).targetUserId, user.id);
    assert.equal(notificationInput(input).category, "message");
    assert.match(validateNotification(values({ audienceType: "user" })).targetUserId, /Choose a user/);
});
test("title and body are bounded and empty trimmed values fail", () => {
    for (const input of [{ title: " " }, { body: " " }, { title: "x".repeat(256) }, { body: "x".repeat(1001) }]) assert.ok(Object.keys(validateNotification(values(input))).length);
});
test("CTA fields are paired and lengths match the server limits", () => {
    assert.ok(validateNotification(values({ linkLabel: "Open" }))["content.cta.href"]);
    assert.ok(validateNotification(values({ linkHref: "/dashboard" }))["content.cta.label"]);
    assert.ok(validateNotification(values({ linkLabel: "x".repeat(256), linkHref: "/dashboard" }))["content.cta.label"]);
    assert.ok(validateNotification(values({ linkLabel: "Open", linkHref: "/"+"x".repeat(2048) }))["content.cta.href"]);
    assert.deepEqual(notificationInput(values({ linkLabel: " Open ", linkHref: " /dashboard " })).content.cta, { label: "Open", href: "/dashboard" });
});
for (const href of ["/dashboard", "/practice?track=mmi#start", "https://bedside.win/help"]) test(`CTA accepts ${href}`, () => assert.equal(safeNotificationHref(href), true));
for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,hello", "http://evil.test", "//evil.test", "/\\evil.test", "https://u:p@evil.test", "https://evil.test/\npath", "file:///etc/passwd", "vbscript:msgbox(1)", "blob:https://bedside.win/id", "dashboard"]) test(`CTA rejects ${href}`, () => assert.equal(safeNotificationHref(href), false));
test("expiry is optional; supplied expiry must be valid and future and is serialized to UTC", () => {
    const now = Date.parse("2026-10-30T12:00:00Z");
    for (const expiresAt of ["invalid", "2026-10-30T11:59:00Z", "2026-10-30T12:00:00Z"]) assert.ok(validateNotification(values({expiresAt}), now).expiresAt);
    const input=values({expiresAt:"2026-10-31T14:00:00Z"});
    assert.deepEqual(validateNotification(input, now), {});
    assert.equal(notificationInput(input).expiresAt,"2026-10-31T14:00:00.000Z");
});
test("user labels handle nullable names returned by the server", () => {
    assert.equal(userLabel(user),"Alex Lee");
    assert.equal(userLabel({...user,firstName:null,lastName:null}),user.email);
    assert.equal(userLabel({...user,firstName:null,lastName:null,email:null}),user.id);
});
test("list request uses Bearer auth, no-store, and the array response", async () => {
    mock.method(globalThis,"fetch",async(url,init)=>{assert.equal(url,"https://api.example.test/api/admin/notifications?page=1&limit=20");assert.equal(init.method,"GET");assert.equal(init.headers.Authorization,"Bearer test-token");assert.equal(init.cache,"no-store");return Response.json([row()]);});
    assert.deepEqual(await listNotifications("test-token"),[row()]);
});
test("create request posts only the exact input and returns the published row", async () => {
    const input=notificationInput(values());
    mock.method(globalThis,"fetch",async(url,init)=>{assert.equal(url,"https://api.example.test/api/admin/notifications");assert.equal(init.method,"POST");assert.deepEqual(JSON.parse(init.body),input);return Response.json(row(),{status:201});});
    assert.deepEqual(await createNotification("test-token",input),row());
});
test("archive request uses POST and preserves returned archived engagement counts", async () => {
    const archived=row({status:"archived",readCount:9,dismissCount:4});
    mock.method(globalThis,"fetch",async(url,init)=>{assert.equal(url,`https://api.example.test/api/admin/notifications/${archived.id}/archive`);assert.equal(init.method,"POST");assert.equal(init.body,undefined);return Response.json(archived);});
    assert.deepEqual(await archiveNotification("test-token",archived.id),archived);
});
test("API failures retain status and server field errors", async () => {
    mock.method(globalThis,"fetch",async()=>Response.json({error:"Invalid request",details:{fieldErrors:{"content.title":["Title rejected"]}}},{status:400}));
    await assert.rejects(createNotification("test-token",notificationInput(values())),(error)=>error.status===400&&error.fieldError("content.title")==="Title rejected");
    mock.restoreAll();mock.method(globalThis,"fetch",async()=>Response.json({error:"Forbidden"},{status:403}));
    await assert.rejects(listNotifications("test-token"),(error)=>error.status===403);
});
test("sent list renders title, audience, date, status and server counts", () => {
    const html=renderToStaticMarkup(createElement(SentNotifications,{page:1,requestedPage:1,failedPage:null,onPageChange:()=>{},onRetry:()=>{},items:[row(),row({id:user.id,audienceType:"user",targetUserId:user.id,status:"archived"})],loading:false,canWrite:true,pendingActionId:null,onArchive:async()=>{}}));
    for (const value of ["Practice update","Everyone","One user",user.id,"published","archived"]) assert.ok(html.includes(value));
    assert.match(html,/>7<\/td>/);assert.match(html,/>2<\/td>/);assert.match(html,/disabled=""/);
});
test("read-only list has no archive action and empty/loading states differ", () => {
    const props={page:1,requestedPage:1,failedPage:null,onPageChange:()=>{},onRetry:()=>{},items:[row()],loading:false,canWrite:false,pendingActionId:null,onArchive:async()=>{}};
    assert.doesNotMatch(renderToStaticMarkup(createElement(SentNotifications,props)),/Archive Practice/);
    assert.match(renderToStaticMarkup(createElement(SentNotifications,{...props,items:[]})),/No notifications on this page/);
    assert.match(renderToStaticMarkup(createElement(SentNotifications,{...props,loading:true})),/Loading notification page 1/);
    assert.match(renderToStaticMarkup(createElement(SentNotifications,{...props,items:[],error:"Failed"})),/sent list is unavailable/);
});

test("recipient lookup uses the notification endpoint, trimmed search and bounded default page size", async () => {
    mock.method(globalThis, "fetch", async (url, init) => {
        const parsed = new URL(url);
        assert.equal(parsed.pathname, "/api/admin/notifications/recipients");
        assert.deepEqual(Object.fromEntries(parsed.searchParams), { search: "Alex + Lee", page: "1", limit: "20" });
        assert.equal(init.method, "GET");
        assert.equal(init.headers.Authorization, "Bearer test-token");
        assert.equal(init.cache, "no-store");
        return Response.json({ users: [user], total: 1 });
    });
    assert.deepEqual(await searchNotificationRecipients("test-token", " Alex + Lee "), { users: [user], total: 1 });
});
test("recipient lookup supports pagination and empty responses", async () => {
    mock.method(globalThis, "fetch", async (url) => {
        assert.deepEqual(Object.fromEntries(new URL(url).searchParams), { search: "missing", page: "2", limit: "5" });
        return Response.json({ users: [], total: 0 });
    });
    assert.deepEqual(await searchNotificationRecipients("test-token", "missing", 2, 5), { users: [], total: 0 });
});
test("recipient search errors preserve permission and validation failures", async () => {
    for (const status of [400, 403, 500]) {
        mock.method(globalThis, "fetch", async () => Response.json({ error: "Search failed" }, { status }));
        await assert.rejects(searchNotificationRecipients("test-token", "Alex"), (error) => error.status === status && error.message === "Search failed");
        mock.restoreAll();
    }
});
test("missing private recipient remains private and fails validation instead of becoming a broadcast", () => {
    const input = values({ audienceType: "user", targetUser: null });
    assert.ok(validateNotification(input).targetUserId);
    assert.equal(notificationInput(input).audienceType, "user");
    assert.equal(notificationInput(input).category, "message");
    assert.equal(notificationInput(input).targetUserId, undefined);
});

test("sent-list requests pass the requested page and limit without changing the array response", async () => {
    mock.method(globalThis, "fetch", async (url) => {
        assert.equal(url, "https://api.example.test/api/admin/notifications?page=3&limit=20");
        return Response.json([row()]);
    });
    assert.deepEqual(await listNotifications("test-token", 3, 20), [row()]);
});
test("pagination keeps later pages reachable after empty pages and offers retry for failed pages", () => {
    const props = { items: [], page: 2, requestedPage: 2, failedPage: null, loading: false, canWrite: false, pendingActionId: null, onArchive: async () => {}, onPageChange: () => {}, onRetry: () => {} };
    const html = renderToStaticMarkup(createElement(SentNotifications, props));
    assert.match(html, /Page 2/);
    assert.match(html, /No notifications on this page/);
    assert.doesNotMatch(html, /disabled=/);
    assert.match(renderToStaticMarkup(createElement(SentNotifications, { ...props, failedPage: 3, error: "Failed" })), /Retry page 3/);
});
