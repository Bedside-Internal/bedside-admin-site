"use client";

import { useCallback, useMemo, useState } from "react";
import { ApiError, humanizeField } from "@/lib/api/http";

type FormError = {
    message: string;
    status?: number;
    fieldErrors: Record<string, string[]>;
    formErrors: string[];
};

/**
 * Submit handling for admin forms. Guarantees that a failed save is always
 * shown *inside the form* (never as an unhandled rejection or hidden behind a
 * modal backdrop).
 *
 *   const form = useFormSubmit({ name: "Name", subtitle: "Subtitle" });
 *   const ok = await form.run(() => onSubmit(input));   // false on failure
 *   <input ... aria-invalid={!!form.fieldError("name")} />
 *   <FieldError message={form.fieldError("name")} />
 *   <FormErrorBanner message={form.bannerMessage} />
 *
 * `fields` maps each API field name the form renders to its on-screen label.
 * Errors for fields the form does *not* render (or that have no field at all,
 * e.g. "Slug already in use") go to the banner, labelled, so nothing is lost.
 */
export function useFormSubmit(fields: Record<string, string> = {}) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<FormError | null>(null);

    const run = useCallback(async (fn: () => Promise<unknown>): Promise<boolean> => {
        setSubmitting(true);
        setError(null);
        try {
            await fn();
            return true;
        } catch (e) {
            if (e instanceof ApiError) {
                setError({
                    message: e.message,
                    status: e.status,
                    fieldErrors: e.fieldErrors,
                    formErrors: e.formErrors,
                });
            } else {
                setError({
                    message: e instanceof Error && e.message ? e.message : "Something went wrong. Please try again.",
                    fieldErrors: {},
                    formErrors: [],
                });
            }
            return false;
        } finally {
            setSubmitting(false);
        }
    }, []);

    /** First message for a field, including nested paths ("prompts" matches "prompts.1.text"). */
    const fieldError = useCallback(
        (name: string): string | undefined => {
            if (!error) return undefined;
            const exact = error.fieldErrors[name]?.[0];
            if (exact) return exact;
            const key = Object.keys(error.fieldErrors).find((k) => k.startsWith(`${name}.`));
            return key ? error.fieldErrors[key]?.[0] : undefined;
        },
        [error],
    );

    /** Forget one field's error as soon as the person edits it. */
    const clearField = useCallback((name: string) => {
        setError((prev) => {
            if (!prev) return prev;
            const rest = Object.fromEntries(
                Object.entries(prev.fieldErrors).filter(([k]) => k !== name && !k.startsWith(`${name}.`)),
            );
            const stillHasFieldErrors = Object.keys(rest).length > 0;
            if (!stillHasFieldErrors && prev.formErrors.length === 0 && Object.keys(prev.fieldErrors).length > 0) {
                return null; // that was the last highlighted problem
            }
            return { ...prev, fieldErrors: rest };
        });
    }, []);

    const clear = useCallback(() => setError(null), []);

    /**
     * Show client-side validation problems (e.g. a required field left blank)
     * through the exact same UI as server errors, without a round trip.
     * Returns true when there were problems, so callers can `if (form.check(...)) return;`
     */
    const check = useCallback((problems: Record<string, string>): boolean => {
        const entries = Object.entries(problems).filter(([, msg]) => !!msg);
        if (entries.length === 0) return false;
        setError({
            message: "Please fix the highlighted fields.",
            fieldErrors: Object.fromEntries(entries.map(([k, msg]) => [k, [msg]])),
            formErrors: [],
        });
        return true;
    }, []);

    const bannerMessage = useMemo(() => {
        if (!error) return null;
        const hasValidation = Object.keys(error.fieldErrors).length > 0 || error.formErrors.length > 0;

        // Not a validation problem (409 conflict, 422 rule, 500, network...): show it as-is.
        if (!hasValidation) return error.message;

        const known = new Set(Object.keys(fields));
        const unclaimed = Object.entries(error.fieldErrors)
            .filter(([k]) => !known.has(k.split(".")[0]!))
            .flatMap(([k, msgs]) => msgs.map((m) => `${fields[k] ?? humanizeField(k)}: ${m}`));
        const lines = [...error.formErrors, ...unclaimed];
        const highlighted = Object.keys(error.fieldErrors).some((k) => known.has(k.split(".")[0]!));

        if (lines.length === 0) return "Please fix the highlighted fields.";
        return highlighted ? ["Please fix the highlighted fields.", ...lines].join("\n") : lines.join("\n");
    }, [error, fields]);

    /**
     * Every problem, labelled ("Title: This field can't be empty"), for layouts
     * with no room for text under each field (e.g. inline table-row editing).
     */
    const summary = useMemo(() => {
        if (!error) return null;
        const lines = [
            ...error.formErrors,
            ...Object.entries(error.fieldErrors).flatMap(([k, msgs]) =>
                msgs.map((m) => `${fields[k] ?? fields[k.split(".")[0]!] ?? humanizeField(k)}: ${m}`),
            ),
        ];
        return lines.length > 0 ? lines.join("\n") : error.message;
    }, [error, fields]);

    return { run, check, submitting, error, fieldError, clearField, clear, bannerMessage, summary };
}
