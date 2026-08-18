"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import type { AdminFormatCard, FormatCardAccent } from "@/types/marketing";

const accentDot: Record<FormatCardAccent, string> = {
    mint: "bg-mint",
    coral: "bg-coral",
    amber: "bg-amber",
    violet: "bg-violet",
};

interface FormatCardRowProps {
    item: AdminFormatCard;
    isFirst: boolean;
    isLast: boolean;
    canWrite: boolean;
    canDelete: boolean;
    onMove: (id: string, direction: "up" | "down") => void;
    onEdit: (item: AdminFormatCard) => void;
    onDelete: (item: AdminFormatCard) => void;
}

export default function FormatCardRow({
    item,
    isFirst,
    isLast,
    canWrite,
    canDelete,
    onMove,
    onEdit,
    onDelete,
}: FormatCardRowProps) {
    return (
        <div className="flex items-center border-b border-ink/10">
            {/* Reorder arrows */}
            <div className="w-[60px] flex-shrink-0 px-2 py-2.5">
                {canWrite && (
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onMove(item.id, "up")}
                            disabled={isFirst}
                            className="text-mint transition-colors hover:text-mint-hover disabled:cursor-not-allowed disabled:text-ink/15"
                        >
                            <ChevronUp size={14} />
                        </button>
                        <button
                            onClick={() => onMove(item.id, "down")}
                            disabled={isLast}
                            className="text-mint transition-colors hover:text-mint-hover disabled:cursor-not-allowed disabled:text-ink/15"
                        >
                            <ChevronDown size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Color */}
            <div className="w-[80px] flex-shrink-0 px-3 py-2.5">
                <span className={`inline-block h-3 w-3 rounded-full ${accentDot[item.accent]}`} />
            </div>

            {/* Title */}
            <div className="w-[160px] flex-shrink-0 px-3 py-2.5">
                <span className="text-[13px] font-semibold text-ink">{item.title}</span>
            </div>

            {/* Description */}
            <div className="min-w-[220px] flex-1 px-3 py-2.5">
                <span className="line-clamp-2 text-[13px] leading-snug text-ink/70">
                    {item.description}
                </span>
            </div>

            {/* Actions */}
            <div className="w-[100px] flex-shrink-0 px-3 py-2.5 text-right">
                {canWrite && (
                    <span
                        onClick={() => onEdit(item)}
                        className="mr-3 cursor-pointer whitespace-nowrap text-[13px] font-medium text-mint hover:text-mint-hover"
                    >
                        Edit
                    </span>
                )}
                {canDelete && (
                    <span
                        onClick={() => onDelete(item)}
                        className="cursor-pointer whitespace-nowrap text-[13px] font-medium text-coral hover:brightness-110"
                    >
                        Delete
                    </span>
                )}
            </div>
        </div>
    );
}