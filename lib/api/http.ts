import type { ApiErrorResponse } from "@/types/admin";

/**
 * Error thrown for every non-2xx response from the API.
 *
 * `message` is a human-readable summary that already includes field names
 * (e.g. "Title: Too small…"), so existing `toast.error(err.message)` call
 * sites improve with no changes. Forms that want inline errors can read
 * `fieldErrors` (keys are dotted paths, e.g. "prompts.1.text").
 */
export class ApiError extends Error {
    status: number;
    fieldErrors: Record<string, string[]>;
    formErrors: string[];

    constructor(
        message: string,
        status: number,
        fieldErrors: Record<string, string[]> = {},
        formErrors: string[] = [],
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fieldErrors = fieldErrors;
        this.formErrors = formErrors;
    }

    /** First message for a field (or any nested field beneath it). */
    fieldError(field: string): string | undefined {
        const exact = this.fieldErrors[field]?.[0];
        if (exact) return exact;
        const prefix = `${field}.`;
        const key = Object.keys(this.fieldErrors).find((k) => k.startsWith(prefix));
        return key ? this.fieldErrors[key]?.[0] : undefined;
    }
}

/**
 * Zod's default wording is written for developers ("Too small: expected string
 * to have >=1 characters"). Admins are not developers, so translate the common
 * cases into plain language. Anything unrecognized is passed through untouched.
 */
export function friendlyMessage(raw: string): string {
    let m: RegExpMatchArray | null;

    // Missing / empty
    if (/expected \w+, received (undefined|null)/i.test(raw)) return "This field is required";
    if ((m = raw.match(/^Too small: expected string to have >=\s*(\d+) characters?/i))) {
        return Number(m[1]) <= 1 ? "This field can't be empty" : `Must be at least ${m[1]} characters`;
    }
    if ((m = raw.match(/^Too small: expected array to have >=\s*(\d+) items?/i))) {
        return Number(m[1]) <= 1 ? "Add at least one item" : `Add at least ${m[1]} items`;
    }

    // Too long / too big
    if ((m = raw.match(/^Too big: expected string to have <=\s*(\d+) characters?/i))) return `Must be ${m[1]} characters or fewer`;
    if ((m = raw.match(/^Too big: expected array to have <=\s*(\d+) items?/i))) return `No more than ${m[1]} items allowed`;

    // Numbers
    if ((m = raw.match(/^Too small: expected number to be >=\s*(-?[\d.]+)/i))) return `Must be ${m[1]} or more`;
    if ((m = raw.match(/^Too big: expected number to be <=\s*(-?[\d.]+)/i))) return `Must be ${m[1]} or less`;
    if (/expected number, received (NaN|string)/i.test(raw)) return "Enter a number";
    if (/expected int/i.test(raw)) return "Enter a whole number";

    // Formats
    if (/^Invalid (URL|url)/.test(raw)) return "Enter a valid web address (starting with https://)";
    if (/^Invalid email/i.test(raw)) return "Enter a valid email address";
    if (/^Invalid (UUID|uuid)/.test(raw)) return "That doesn't look like a valid ID";
    if (/^Invalid option: expected one of/i.test(raw)) return "Pick one of the available options";
    if (/expected boolean/i.test(raw)) return "Choose yes or no";

    return raw;
}

const MAX_LINES = 3;

/** "iconKey" -> "Icon key", "parent_track" -> "Parent track", "prompts.1.text" -> "Prompts › #2 › Text" */
export function humanizeField(path: string, labels: Record<string, string> = {}): string {
    if (labels[path]) return labels[path];
    return path
        .split(".")
        .map((seg) => {
            if (/^\d+$/.test(seg)) return `#${Number(seg) + 1}`;
            if (labels[seg]) return labels[seg];
            const spaced = seg
                .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
                .replace(/[_-]+/g, " ")
                .trim()
                .toLowerCase();
            return spaced.charAt(0).toUpperCase() + spaced.slice(1);
        })
        .join(" › ");
}

export function summarizeValidation(
    fieldErrors: Record<string, string[]>,
    formErrors: string[],
    labels?: Record<string, string>,
): string {
    const lines = [
        ...formErrors,
        ...Object.entries(fieldErrors).flatMap(([field, msgs]) =>
            msgs.map((m) => `${humanizeField(field, labels)}: ${m}`),
        ),
    ];
    if (lines.length <= MAX_LINES) return lines.join("\n");
    return [...lines.slice(0, MAX_LINES), `+${lines.length - MAX_LINES} more`].join("\n");
}

/** Parse a non-ok Response into an ApiError. Never throws anything else. */
export async function toApiError(res: Response): Promise<ApiError> {
    const body: ApiErrorResponse = await res.json().catch(() => ({ error: "Request failed" }));

    // Tolerate legacy routes that put the flatten() object straight in `error`.
    const legacy =
        body.error && typeof body.error === "object"
            ? (body.error as unknown as { fieldErrors?: Record<string, string[]>; formErrors?: string[] })
            : undefined;

    const rawFields = body.details?.fieldErrors ?? legacy?.fieldErrors ?? {};
    const fieldErrors = Object.fromEntries(
        Object.entries(rawFields).map(([k, msgs]) => [k, msgs.map(friendlyMessage)]),
    );
    const formErrors = (body.details?.formErrors ?? legacy?.formErrors ?? []).map(friendlyMessage);
    const summary = summarizeValidation(fieldErrors, formErrors);
    const fallback = typeof body.error === "string" ? body.error : undefined;

    return new ApiError(summary || fallback || `HTTP ${res.status}`, res.status, fieldErrors, formErrors);
}

export async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) throw await toApiError(res);
    if (res.status === 204) return undefined as T;
    return res.json();
}
