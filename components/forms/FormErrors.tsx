"use client";

/** Red helper text shown directly under an input. */
export function FieldError({ message }: { message?: string | null }) {
    if (!message) return null;
    return (
        <p role="alert" className="mt-1.5 text-[12px] font-medium text-coral">
            {message}
        </p>
    );
}

/**
 * Summary banner for a form. Put it right above the Save/Cancel buttons: in
 * long, scrolling modals the person's eyes (and cursor) are already there, so
 * they can't miss it even when the offending field is scrolled out of view.
 */
export function FormErrorBanner({ message }: { message?: string | null }) {
    if (!message) return null;
    return (
        <div
            role="alert"
            className="mt-5 whitespace-pre-line rounded-md border border-coral/30 bg-coral/10 px-3.5 py-2.5 text-[13px] text-coral"
        >
            {message}
        </div>
    );
}

/** Tailwind classes for a text input's border, red when it has an error. */
export function inputBorder(hasError: boolean): string {
    return hasError
        ? "border-coral focus:border-coral"
        : "border-ink/15 focus:border-mint";
}
