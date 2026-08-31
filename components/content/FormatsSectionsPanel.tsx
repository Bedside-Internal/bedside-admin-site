"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Format, Dimension, Section } from "@/types/content";

/* Kill-reason modal */

function KillReasonModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30">
      <div className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-5 text-left shadow-lg">
        <h3 className="font-poppins text-base font-bold">Confirm deletion</h3>
        <p className="mt-1 text-sm text-ink/50">
          Please provide a reason for this deletion.
        </p>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-3 w-full rounded-md border border-ink/10 bg-sand/60 px-3 py-2 text-sm outline-none focus:border-mint-500"
          rows={3}
          placeholder="Reason for deletion…"
        />
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-ink/10 px-4 py-2 text-sm text-ink/60 hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            className="rounded-md bg-coral-500 px-4 py-2 text-sm font-medium text-white hover:bg-coral-600 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function KillButton({
  onKill,
  label = "Delete",
}: {
  onKill: (reason: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-mint-600 hover:text-mint-700"
      >
        {label}
      </button>
      {open && (
        <KillReasonModal
          onConfirm={(r) => {
            onKill(r);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}

/* Shared cell styles */

const c = "px-3 py-2 text-sm";
const inp =
  "w-full rounded border border-ink/10 bg-sand/60 px-2 py-1 text-sm outline-none focus:border-mint-500";
const sel =
  "rounded border border-ink/10 bg-sand/60 px-2 py-1 text-sm outline-none focus:border-mint-500";

/* Formats table */

function FormatsTable({
  formats,
  onSave,
  onKill,
  onRestore,
}: {
  formats: Format[];
  onSave: (d: {
    id?: string;
    slug: string;
    title: string;
    subtitle?: string;
    iconKey?: string;
  }) => Promise<any>;
  onKill: (id: string, reason: string) => void;
  onRestore: (id: string) => void;
}) {
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [newRow, setNewRow] = useState<{
    title: string;
    slug: string;
    subtitle: string;
    iconKey: string;
  } | null>(null);

  const v = (id: string, field: string, fallback: string) =>
    edits[id]?.[field] ?? fallback ?? "";

  const set = (id: string, field: string, value: string) =>
    setEdits((p) => ({ ...p, [id]: { ...p[id], [field]: value } }));

  const saveExisting = async (f: Format) => {
    const e = edits[f.id];
    if (!e) return;
    const hasChange = Object.entries(e).some(
      ([k, val]) => String((f as any)[k] ?? "") !== val,
    );
    if (!hasChange) {
      setEdits((p) => {
        const n = { ...p };
        delete n[f.id];
        return n;
      });
      return;
    }
    try {
      await onSave({
        id: f.id,
        slug: e.slug ?? f.slug,
        title: e.title ?? f.title,
        subtitle: e.subtitle !== undefined ? e.subtitle : f.subtitle ?? "",
        iconKey: e.iconKey !== undefined ? e.iconKey : f.iconKey ?? "",
      });
      setEdits((p) => {
        const n = { ...p };
        delete n[f.id];
        return n;
      });
    } catch {
      /* handled by hook */
    }
  };

  const saveNew = async () => {
    if (!newRow || !newRow.title.trim() || !newRow.slug.trim()) return;
    try {
      await onSave({
        slug: newRow.slug,
        title: newRow.title,
        subtitle: newRow.subtitle || undefined,
        iconKey: newRow.iconKey || undefined,
      });
      setNewRow(null);
    } catch {
      /* handled by hook */
    }
  };

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-ink/70">Formats</h3>
      <div className="overflow-x-auto rounded-lg border border-ink/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs font-semibold tracking-wider text-ink/50">
              <th className={c}>TITLE</th>
              <th className={c}>SLUG</th>
              <th className={c}>SUBTITLE</th>
              <th className={c}>ICON KEY</th>
              <th className={c}>SORT</th>
              <th className={`${c} w-20`} />
            </tr>
          </thead>
          <tbody>
            {formats.map((f) => (
              <tr
                key={f.id}
                className={`border-b border-ink/5 last:border-0 ${f.killed ? "opacity-40" : ""}`}
              >
                <td className={c}>
                  <input
                    className={inp}
                    value={v(f.id, "title", f.title)}
                    onChange={(e) => set(f.id, "title", e.target.value)}
                    onBlur={() => saveExisting(f)}
                    disabled={f.killed}
                  />
                </td>
                <td className={c}>
                  <input
                    className={inp}
                    value={v(f.id, "slug", f.slug)}
                    onChange={(e) => set(f.id, "slug", e.target.value)}
                    onBlur={() => saveExisting(f)}
                    disabled={f.killed}
                  />
                </td>
                <td className={c}>
                  <input
                    className={inp}
                    value={v(f.id, "subtitle", f.subtitle ?? "")}
                    onChange={(e) => set(f.id, "subtitle", e.target.value)}
                    onBlur={() => saveExisting(f)}
                    disabled={f.killed}
                  />
                </td>
                <td className={c}>
                  <input
                    className={inp}
                    value={v(f.id, "iconKey", f.iconKey ?? "")}
                    onChange={(e) => set(f.id, "iconKey", e.target.value)}
                    onBlur={() => saveExisting(f)}
                    disabled={f.killed}
                  />
                </td>
                <td className={`${c} text-ink/30`}>—</td>
                <td className={`${c} text-right`}>
                  {f.killed ? (
                    <button
                      type="button"
                      onClick={() => onRestore(f.id)}
                      className="text-xs font-medium text-mint-600 hover:text-mint-700"
                    >
                      Restore
                    </button>
                  ) : (
                    <KillButton onKill={(r) => onKill(f.id, r)} />
                  )}
                </td>
              </tr>
            ))}
            {newRow && (
              <tr className="border-b border-ink/5">
                <td className={c}>
                  <input
                    className={inp}
                    placeholder="Title"
                    value={newRow.title}
                    onChange={(e) =>
                      setNewRow({ ...newRow, title: e.target.value })
                    }
                  />
                </td>
                <td className={c}>
                  <input
                    className={inp}
                    placeholder="slug"
                    value={newRow.slug}
                    onChange={(e) =>
                      setNewRow({ ...newRow, slug: e.target.value })
                    }
                  />
                </td>
                <td className={c}>
                  <input
                    className={inp}
                    placeholder="Subtitle"
                    value={newRow.subtitle}
                    onChange={(e) =>
                      setNewRow({ ...newRow, subtitle: e.target.value })
                    }
                  />
                </td>
                <td className={c}>
                  <input
                    className={inp}
                    placeholder="Icon key"
                    value={newRow.iconKey}
                    onChange={(e) =>
                      setNewRow({ ...newRow, iconKey: e.target.value })
                    }
                  />
                </td>
                <td className={`${c} text-ink/30`}>—</td>
                <td className={`${c} text-right`}>
                  <button
                    type="button"
                    onClick={saveNew}
                    disabled={!newRow.title.trim() || !newRow.slug.trim()}
                    className="text-xs font-medium text-mint-600 hover:text-mint-700 disabled:opacity-40"
                  >
                    Save
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() =>
          setNewRow({ title: "", slug: "", subtitle: "", iconKey: "" })
        }
        disabled={!!newRow}
        className="mt-2 w-full rounded-lg border border-dashed border-ink/15 py-2 text-sm text-mint-600 hover:border-mint-400 hover:bg-mint-50/50 disabled:opacity-40"
      >
        <Plus className="mr-1 inline h-3.5 w-3.5" />
        Add format
      </button>
    </div>
  );
}

/* Dimensions table */

function DimensionsTable({
  dimensions,
  formats,
  onSave,
  onKill,
  onRestore,
}: {
  dimensions: Dimension[];
  formats: Format[];
  onSave: (d: {
    id?: string;
    formatId: string;
    label: string;
    slug: string;
    subtitle?: string;
    iconKey?: string;
    sortOrder?: number;
  }) => Promise<any>;
  onKill: (id: string, reason: string) => void;
  onRestore: (id: string) => void;
}) {
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [newRow, setNewRow] = useState<{
    formatId: string;
    label: string;
    slug: string;
    subtitle: string;
    iconKey: string;
    sortOrder: string;
  } | null>(null);

  const v = (id: string, field: string, fallback: string) =>
    edits[id]?.[field] ?? fallback ?? "";

  const set = (id: string, field: string, value: string) =>
    setEdits((p) => ({ ...p, [id]: { ...p[id], [field]: value } }));

  const fmtOpts = formats
    .filter((f) => !f.killed)
    .map((f) => ({ value: f.id, label: f.title }));

  const saveExisting = async (d: Dimension) => {
    const e = edits[d.id];
    if (!e) return;
    const hasChange = Object.entries(e).some(
      ([k, val]) => String((d as any)[k] ?? "") !== val,
    );
    if (!hasChange) {
      setEdits((p) => {
        const n = { ...p };
        delete n[d.id];
        return n;
      });
      return;
    }
    try {
      await onSave({
        id: d.id,
        formatId: d.formatId,
        label: e.label ?? d.label,
        slug: e.slug ?? d.slug,
        subtitle:
          e.subtitle !== undefined ? e.subtitle : d.subtitle ?? "",
        iconKey: e.iconKey !== undefined ? e.iconKey : d.iconKey ?? "",
        sortOrder:
          e.sortOrder !== undefined
            ? Number(e.sortOrder)
            : d.sortOrder,
      });
      setEdits((p) => {
        const n = { ...p };
        delete n[d.id];
        return n;
      });
    } catch {
      /* handled by hook */
    }
  };

  const saveNew = async () => {
    if (!newRow || !newRow.formatId || !newRow.label.trim() || !newRow.slug.trim())
      return;
    try {
      await onSave({
        formatId: newRow.formatId,
        label: newRow.label,
        slug: newRow.slug,
        subtitle: newRow.subtitle || undefined,
        iconKey: newRow.iconKey || undefined,
        sortOrder: newRow.sortOrder ? Number(newRow.sortOrder) : undefined,
      });
      setNewRow(null);
    } catch {
      /* handled by hook */
    }
  };

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-ink/70">Dimensions</h3>
      <div className="overflow-x-auto rounded-lg border border-ink/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs font-semibold tracking-wider text-ink/50">
              <th className={c}>LABEL</th>
              <th className={c}>FORMAT</th>
              <th className={c}>SLUG</th>
              <th className={c}>SORT</th>
              <th className={`${c} w-20`} />
            </tr>
          </thead>
          <tbody>
            {dimensions.map((d) => {
              const fmtTitle =
                formats.find((f) => f.id === d.formatId)?.title ?? "—";
              return (
                <tr
                  key={d.id}
                  className={`border-b border-ink/5 last:border-0 ${d.killed ? "opacity-40" : ""}`}
                >
                  <td className={c}>
                    <input
                      className={inp}
                      value={v(d.id, "label", d.label)}
                      onChange={(e) => set(d.id, "label", e.target.value)}
                      onBlur={() => saveExisting(d)}
                      disabled={d.killed}
                    />
                  </td>
                  <td className={c}>
                    {d.killed ? (
                      <span className="text-ink/40">{fmtTitle}</span>
                    ) : (
                      <span className="text-ink/60">{fmtTitle}</span>
                    )}
                  </td>
                  <td className={c}>
                    <input
                      className={inp}
                      value={v(d.id, "slug", d.slug)}
                      onChange={(e) => set(d.id, "slug", e.target.value)}
                      onBlur={() => saveExisting(d)}
                      disabled={d.killed}
                    />
                  </td>
                  <td className={c}>
                    <input
                      type="number"
                      className={inp}
                      value={v(d.id, "sortOrder", String(d.sortOrder))}
                      onChange={(e) => set(d.id, "sortOrder", e.target.value)}
                      onBlur={() => saveExisting(d)}
                      disabled={d.killed}
                    />
                  </td>
                  <td className={`${c} text-right`}>
                    {d.killed ? (
                      <button
                        type="button"
                        onClick={() => onRestore(d.id)}
                        className="text-xs font-medium text-mint-600 hover:text-mint-700"
                      >
                        Restore
                      </button>
                    ) : (
                      <KillButton onKill={(r) => onKill(d.id, r)} />
                    )}
                  </td>
                </tr>
              );
            })}
            {newRow && (
              <tr className="border-b border-ink/5">
                <td className={c}>
                  <input
                    className={inp}
                    placeholder="Label"
                    value={newRow.label}
                    onChange={(e) =>
                      setNewRow({ ...newRow, label: e.target.value })
                    }
                  />
                </td>
                <td className={c}>
                  <select
                    className={sel}
                    value={newRow.formatId}
                    onChange={(e) =>
                      setNewRow({ ...newRow, formatId: e.target.value })
                    }
                  >
                    <option value="">Select format…</option>
                    {fmtOpts.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={c}>
                  <input
                    className={inp}
                    placeholder="slug"
                    value={newRow.slug}
                    onChange={(e) =>
                      setNewRow({ ...newRow, slug: e.target.value })
                    }
                  />
                </td>
                <td className={c}>
                  <input
                    type="number"
                    className={inp}
                    placeholder="0"
                    value={newRow.sortOrder}
                    onChange={(e) =>
                      setNewRow({ ...newRow, sortOrder: e.target.value })
                    }
                  />
                </td>
                <td className={`${c} text-right`}>
                  <button
                    type="button"
                    onClick={saveNew}
                    disabled={
                      !newRow.formatId ||
                      !newRow.label.trim() ||
                      !newRow.slug.trim()
                    }
                    className="text-xs font-medium text-mint-600 hover:text-mint-700 disabled:opacity-40"
                  >
                    Save
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() =>
          setNewRow({
            formatId: "",
            label: "",
            slug: "",
            subtitle: "",
            iconKey: "",
            sortOrder: "",
          })
        }
        disabled={!!newRow}
        className="mt-2 w-full rounded-lg border border-dashed border-ink/15 py-2 text-sm text-mint-600 hover:border-mint-400 hover:bg-mint-50/50 disabled:opacity-40"
      >
        <Plus className="mr-1 inline h-3.5 w-3.5" />
        Add dimension
      </button>
    </div>
  );
}

/* Sections table */

function SectionsTable({
  sections,
  formats,
  dimensions,
  onSave,
  onKill,
  onRestore,
}: {
  sections: Section[];
  formats: Format[];
  dimensions: Dimension[];
  onSave: (d: {
    id?: string;
    formatId: string;
    dimensionId?: string;
    title: string;
    slug: string;
    subtitle?: string;
    iconKey?: string;
    sortOrder?: number;
  }) => Promise<any>;
  onKill: (id: string, reason: string) => void;
  onRestore: (id: string) => void;
}) {
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [newRow, setNewRow] = useState<{
    formatId: string;
    dimensionId: string;
    title: string;
    slug: string;
    subtitle: string;
    iconKey: string;
    sortOrder: string;
  } | null>(null);

  const v = (id: string, field: string, fallback: string) =>
    edits[id]?.[field] ?? fallback ?? "";

  const set = (id: string, field: string, value: string) =>
    setEdits((p) => ({ ...p, [id]: { ...p[id], [field]: value } }));

  const fmtOpts = formats
    .filter((f) => !f.killed)
    .map((f) => ({ value: f.id, label: f.title }));

  const saveExisting = async (s: Section) => {
    const e = edits[s.id];
    if (!e) return;
    const hasChange = Object.entries(e).some(
      ([k, val]) => String((s as any)[k] ?? "") !== val,
    );
    if (!hasChange) {
      setEdits((p) => {
        const n = { ...p };
        delete n[s.id];
        return n;
      });
      return;
    }
    try {
      await onSave({
        id: s.id,
        formatId: s.formatId,
        dimensionId: e.dimensionId !== undefined ? e.dimensionId : s.dimensionId ?? "",
        title: e.title ?? s.title,
        slug: e.slug ?? s.slug,
        subtitle:
          e.subtitle !== undefined ? e.subtitle : s.subtitle ?? "",
        iconKey: e.iconKey !== undefined ? e.iconKey : s.iconKey ?? "",
        sortOrder:
          e.sortOrder !== undefined
            ? Number(e.sortOrder)
            : s.sortOrder,
      });
      setEdits((p) => {
        const n = { ...p };
        delete n[s.id];
        return n;
      });
    } catch {
      /* handled by hook */
    }
  };

  const saveNew = async () => {
    if (!newRow || !newRow.formatId || !newRow.title.trim() || !newRow.slug.trim())
      return;
    try {
      await onSave({
        formatId: newRow.formatId,
        dimensionId: newRow.dimensionId || undefined,
        title: newRow.title,
        slug: newRow.slug,
        subtitle: newRow.subtitle || undefined,
        iconKey: newRow.iconKey || undefined,
        sortOrder: newRow.sortOrder ? Number(newRow.sortOrder) : undefined,
      });
      setNewRow(null);
    } catch {
      /* handled by hook */
    }
  };

  const dimOptsForFormat = (formatId: string) =>
    dimensions
      .filter((d) => d.formatId === formatId && !d.killed)
      .map((d) => ({ value: d.id, label: d.label }));

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-ink/70">Sections</h3>
      <div className="overflow-x-auto rounded-lg border border-ink/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs font-semibold tracking-wider text-ink/50">
              <th className={c}>TITLE</th>
              <th className={c}>FORMAT</th>
              <th className={c}>DIMENSION</th>
              <th className={c}>SLUG</th>
              <th className={c}>SORT</th>
              <th className={`${c} w-20`} />
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => {
              const fmtTitle =
                formats.find((f) => f.id === s.formatId)?.title ?? "—";
              const dimLabel = s.dimensionId
                ? dimensions.find((d) => d.id === s.dimensionId)?.label ?? "—"
                : "—";
              const currentDimFormatId = edits[s.id]?.formatId
                ? undefined
                : s.formatId;
              const dimOpts = currentDimFormatId
                ? dimOptsForFormat(currentDimFormatId)
                : [];
              return (
                <tr
                  key={s.id}
                  className={`border-b border-ink/5 last:border-0 ${s.killed ? "opacity-40" : ""}`}
                >
                  <td className={c}>
                    <input
                      className={inp}
                      value={v(s.id, "title", s.title)}
                      onChange={(e) => set(s.id, "title", e.target.value)}
                      onBlur={() => saveExisting(s)}
                      disabled={s.killed}
                    />
                  </td>
                  <td className={c}>
                    <span className="text-ink/60">{fmtTitle}</span>
                  </td>
                  <td className={c}>
                    {s.killed ? (
                      <span className="text-ink/40">{dimLabel}</span>
                    ) : (
                      <select
                        className={sel}
                        value={edits[s.id]?.dimensionId ?? s.dimensionId ?? ""}
                        onChange={(e) => set(s.id, "dimensionId", e.target.value)}
                        onBlur={() => saveExisting(s)}
                      >
                        <option value="">—</option>
                        {dimOpts.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className={c}>
                    <input
                      className={inp}
                      value={v(s.id, "slug", s.slug)}
                      onChange={(e) => set(s.id, "slug", e.target.value)}
                      onBlur={() => saveExisting(s)}
                      disabled={s.killed}
                    />
                  </td>
                  <td className={c}>
                    <input
                      type="number"
                      className={inp}
                      value={v(s.id, "sortOrder", String(s.sortOrder))}
                      onChange={(e) => set(s.id, "sortOrder", e.target.value)}
                      onBlur={() => saveExisting(s)}
                      disabled={s.killed}
                    />
                  </td>
                  <td className={`${c} text-right`}>
                    {s.killed ? (
                      <button
                        type="button"
                        onClick={() => onRestore(s.id)}
                        className="text-xs font-medium text-mint-600 hover:text-mint-700"
                      >
                        Restore
                      </button>
                    ) : (
                      <KillButton onKill={(r) => onKill(s.id, r)} />
                    )}
                  </td>
                </tr>
              );
            })}
            {newRow && (
              <tr className="border-b border-ink/5">
                <td className={c}>
                  <input
                    className={inp}
                    placeholder="Title"
                    value={newRow.title}
                    onChange={(e) =>
                      setNewRow({ ...newRow, title: e.target.value })
                    }
                  />
                </td>
                <td className={c}>
                  <select
                    className={sel}
                    value={newRow.formatId}
                    onChange={(e) =>
                      setNewRow({
                        ...newRow,
                        formatId: e.target.value,
                        dimensionId: "",
                      })
                    }
                  >
                    <option value="">Select format…</option>
                    {fmtOpts.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={c}>
                  <select
                    className={sel}
                    value={newRow.dimensionId}
                    onChange={(e) =>
                      setNewRow({ ...newRow, dimensionId: e.target.value })
                    }
                  >
                    <option value="">—</option>
                    {dimOptsForFormat(newRow.formatId).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={c}>
                  <input
                    className={inp}
                    placeholder="slug"
                    value={newRow.slug}
                    onChange={(e) =>
                      setNewRow({ ...newRow, slug: e.target.value })
                    }
                  />
                </td>
                <td className={c}>
                  <input
                    type="number"
                    className={inp}
                    placeholder="0"
                    value={newRow.sortOrder}
                    onChange={(e) =>
                      setNewRow({ ...newRow, sortOrder: e.target.value })
                    }
                  />
                </td>
                <td className={`${c} text-right`}>
                  <button
                    type="button"
                    onClick={saveNew}
                    disabled={
                      !newRow.formatId ||
                      !newRow.title.trim() ||
                      !newRow.slug.trim()
                    }
                    className="text-xs font-medium text-mint-600 hover:text-mint-700 disabled:opacity-40"
                  >
                    Save
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() =>
          setNewRow({
            formatId: "",
            dimensionId: "",
            title: "",
            slug: "",
            subtitle: "",
            iconKey: "",
            sortOrder: "",
          })
        }
        disabled={!!newRow}
        className="mt-2 w-full rounded-lg border border-dashed border-ink/15 py-2 text-sm text-mint-600 hover:border-mint-400 hover:bg-mint-50/50 disabled:opacity-40"
      >
        <Plus className="mr-1 inline h-3.5 w-3.5" />
        Add section
      </button>
    </div>
  );
}

/* Main panel */

interface FormatsSectionsPanelProps {
  formats: Format[];
  dimensions: Dimension[];
  sections: Section[];
  canDelete: boolean;
  onUpsertFormat: (d: {
    id?: string;
    slug: string;
    title: string;
    subtitle?: string;
    iconKey?: string;
  }) => Promise<any>;
  onKillFormat: (id: string, reason: string) => void;
  onRestoreFormat: (id: string) => void;
  onUpsertDimension: (d: {
    id?: string;
    formatId: string;
    label: string;
    slug: string;
    subtitle?: string;
    iconKey?: string;
    sortOrder?: number;
  }) => Promise<any>;
  onKillDimension: (id: string, reason: string) => void;
  onRestoreDimension: (id: string) => void;
  onUpsertSection: (d: {
    id?: string;
    formatId: string;
    dimensionId?: string;
    title: string;
    slug: string;
    subtitle?: string;
    iconKey?: string;
    sortOrder?: number;
  }) => Promise<any>;
  onKillSection: (id: string, reason: string) => void;
  onRestoreSection: (id: string) => void;
}

export function FormatsSectionsPanel({
  formats,
  dimensions,
  sections,
  canDelete,
  onUpsertFormat,
  onKillFormat,
  onRestoreFormat,
  onUpsertDimension,
  onKillDimension,
  onRestoreDimension,
  onUpsertSection,
  onKillSection,
  onRestoreSection,
}: FormatsSectionsPanelProps) {
  return (
    <div className="space-y-6">
      <label className="text-xs font-semibold tracking-wider text-mint-600">
        FORMATS &amp; SECTIONS
      </label>
      <FormatsTable
        formats={formats}
        onSave={onUpsertFormat}
        onKill={canDelete ? onKillFormat : () => { }}
        onRestore={onRestoreFormat}
      />
      <DimensionsTable
        dimensions={dimensions}
        formats={formats}
        onSave={onUpsertDimension}
        onKill={canDelete ? onKillDimension : () => { }}
        onRestore={onRestoreDimension}
      />
      <SectionsTable
        sections={sections}
        formats={formats}
        dimensions={dimensions}
        onSave={onUpsertSection}
        onKill={canDelete ? onKillSection : () => { }}
        onRestore={onRestoreSection}
      />
    </div>
  );
}