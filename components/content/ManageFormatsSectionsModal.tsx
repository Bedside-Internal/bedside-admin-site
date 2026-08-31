"use client";

import { useState, useEffect, useRef } from "react";
import { GripVertical, X } from "lucide-react";
import { FormatsSectionsPanel } from "./FormatsSectionsPanel";
import type { Format, Dimension, Section } from "@/types/content";

type UpsertFormatInput = {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  iconKey?: string;
  trackId?: string;
};

type UpsertDimensionInput = {
  id?: string;
  formatId: string;
  label: string;
  slug: string;
  subtitle?: string;
  iconKey?: string;
  sortOrder?: number;
};

type UpsertSectionInput = {
  id?: string;
  formatId: string;
  dimensionId?: string;
  title: string;
  slug: string;
  subtitle?: string;
  iconKey?: string;
  sortOrder?: number;
};

interface ManageFormatsSectionsModalProps {
  open: boolean;
  onClose: () => void;
  formats: Format[];
  dimensions: Dimension[];
  sections: Section[];
  canDelete: boolean;
  onUpsertFormat: (data: UpsertFormatInput) => Promise<Format>;
  onKillFormat: (id: string, reason: string) => Promise<void>;
  onRestoreFormat: (id: string) => Promise<void>;
  onUpsertDimension: (data: UpsertDimensionInput) => Promise<Dimension>;
  onKillDimension: (id: string, reason: string) => Promise<void>;
  onRestoreDimension: (id: string) => Promise<void>;
  onUpsertSection: (data: UpsertSectionInput) => Promise<Section>;
  onKillSection: (id: string, reason: string) => Promise<void>;
  onRestoreSection: (id: string) => Promise<void>;
}

export function ManageFormatsSectionsModal({
  open,
  onClose,
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
}: ManageFormatsSectionsModalProps) {
  const [size, setSize] = useState({ width: 900, height: 650 });
  const [isResizing, setIsResizing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!isResizing) return;
    function handleMouseMove(e: MouseEvent) {
      if (!modalRef.current) return;
      const rect = modalRef.current.getBoundingClientRect();
      const newWidth = Math.max(700, e.clientX - rect.left + 10);
      const newHeight = Math.max(500, e.clientY - rect.top + 10);
      setSize({ width: newWidth, height: newHeight });
    }
    function handleMouseUp() {
      setIsResizing(false);
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col"
        style={{
          width: size.width,
          height: size.height,
          maxWidth: "calc(100vw - 48px)",
          maxHeight: "calc(100vh - 48px)",
        }}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4 bg-sand/30">
          <h3 className="font-poppins text-lg font-bold text-ink">
            Manage Formats & Sections
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <FormatsSectionsPanel
            formats={formats}
            dimensions={dimensions}
            sections={sections}
            canDelete={canDelete}
            onUpsertFormat={onUpsertFormat}
            onKillFormat={onKillFormat}
            onRestoreFormat={onRestoreFormat}
            onUpsertDimension={onUpsertDimension}
            onKillDimension={onKillDimension}
            onRestoreDimension={onRestoreDimension}
            onUpsertSection={onUpsertSection}
            onKillSection={onKillSection}
            onRestoreSection={onRestoreSection}
          />
        </div>

        <div
          className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-center justify-center bg-ink/5 hover:bg-ink/10"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
          }}
          aria-label="Resize"
        >
          <GripVertical className="h-4 w-4 text-ink/30" />
        </div>
      </div>
    </div>
  );
}