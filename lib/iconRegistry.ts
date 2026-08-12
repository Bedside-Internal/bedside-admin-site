import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

function isLucideIconComponent(value: unknown): value is LucideIcon {
  return typeof value === "object" && value !== null && "$$typeof" in value && "render" in value;
}

function toKebabCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export const iconRegistry: Record<string, LucideIcon> = Object.fromEntries(
  Object.entries(LucideIcons)
    .filter(([, value]) => isLucideIconComponent(value))
    .map(([name, component]) => [toKebabCase(name), component as LucideIcon]),
);

export function resolveIcon(key: string | null | undefined): LucideIcon {
  if (!key) return iconRegistry["help-circle"];
  return iconRegistry[key] ?? iconRegistry["help-circle"];
}

export const iconKeys: string[] = Object.keys(iconRegistry).sort();