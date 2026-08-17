"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import type { AdminTestimonial } from "@/types/marketing";

const tagColors: Record<string, string> = {
    Partner: "bg-coral/15 text-coral",
    Applicant: "bg-mint/15 text-mint",
};

interface TestimonialRowProps {
    item: AdminTestimonial;
    isFirst: boolean;
    isLast: boolean;
    canWrite: boolean;
    canDelete: boolean;
    onMove: (id: string, direction: "up" | "down") => void;
    onEdit: (item: AdminTestimonial) => void;
    onDelete: (item: AdminTestimonial) => void;
}

export default function TestimonialRow({
    item,
    isFirst,
    isLast,
    canWrite,
    canDelete,
    onMove,
    onEdit,
    onDelete,
}: TestimonialRowProps) {
    return (
        <div className="flex items-center border-b border-ink/10">
            {/* Reorder arrows */}
            <div className="w-[30px] flex-shrink-0 px-2 py-2.5">
                {canWrite && (
                    <div className="flex flex-col items-center gap-0.5">
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

            {/* Name */}
            <div className="w-[150px] flex-shrink-0 px-3 py-2.5">
                <span className="text-[13px] font-semibold text-ink">
                    {item.name}
                </span>
            </div>

            {/* Subtitle */}
            <div className="w-[160px] flex-shrink-0 px-3 py-2.5">
                <span className="text-[13px] text-ink/50">{item.subtitle}</span>
            </div>

            {/* Quote */}
            <div className="min-w-[180px] flex-1 px-3 py-2.5">
                <span className="line-clamp-2 text-[13px] leading-snug text-ink/70">
                    {item.quote}
                </span>
            </div>

            {/* Tag */}
            <div className="w-[90px] flex-shrink-0 px-3 py-2.5">
                <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${tagColors[item.tagLabel] ?? "bg-ink/10 text-ink/40"
                        }`}
                >
                    {item.tagLabel}
                </span>
            </div>

            {/* Group */}
            <div className="w-[100px] flex-shrink-0 px-3 py-2.5">
                <span className="text-[13px] text-ink/40">{item.groupLabel}</span>
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