import { toast } from "sonner";

/**
 * Show an error to the person as a toast (top-right, always on screen — it
 * doesn't matter where they've scrolled). Use for actions with no form to
 * hang the message on: delete confirmations, inline edits, restore, etc.
 */
export function toastError(err: unknown, fallback = "Something went wrong. Please try again.") {
    toast.error(err instanceof Error && err.message ? err.message : fallback);
}
