"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { FeatureRow } from "./FeatureRow";
import { AddFeatureModal } from "./AddFeatureModal";
import type {
  AdminFeature,
  FeatureType,
  UpsertFeatureInput,
} from "@/types/admin";

interface FeatureSectionProps {
  label: string;
  type: FeatureType;
  features: AdminFeature[];
  tracks: AdminFeature[];
  loading: boolean;
  canWrite: boolean;
  onToggleEnabled: (feature: AdminFeature) => Promise<void>;
  onSave: (
    key: string,
    data: UpsertFeatureInput,
  ) => Promise<AdminFeature>;
  onKill: (key: string, reason: string) => Promise<AdminFeature>;
  onRestore: (key: string) => Promise<AdminFeature>;
  onReorder: (
    type: FeatureType,
    reordered: AdminFeature[],
  ) => Promise<void>;
  onAdd: (data: {
    key: string;
    type: FeatureType;
    title: string;
    subtitle: string;
    icon: string;
    href: string | null;
    parent_track: string | null;
    enabled: boolean;
  }) => Promise<void>;
}

function SortableFeatureRow(props: {
  feature: AdminFeature;
  type: FeatureType;
  tracks: AdminFeature[];
  canWrite: boolean;
  onToggleEnabled: (feature: AdminFeature) => Promise<void>;
  onSave: (
    key: string,
    data: UpsertFeatureInput,
  ) => Promise<AdminFeature>;
  onKill: (key: string, reason: string) => Promise<AdminFeature>;
  onRestore: (key: string) => Promise<AdminFeature>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.feature._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FeatureRow
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function FeatureSection({
  label,
  type,
  features,
  tracks,
  loading,
  canWrite,
  onToggleEnabled,
  onSave,
  onKill,
  onRestore,
  onReorder,
  onAdd,
}: FeatureSectionProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const isTrack = type === "track";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = features.findIndex((f) => f._id === active.id);
      const newIndex = features.findIndex((f) => f._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(features, oldIndex, newIndex);
      onReorder(type, reordered);
    },
    [features, type, onReorder],
  );

  return (
    <div>
      {/* Section label */}
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[2px] text-mint">
        {label}
      </div>

      {/* Table header */}
      <div className="flex items-center border-b-2 border-ink/10">
        <div className="w-[30px] flex-shrink-0 px-2 py-2" />
        <div className="w-52 flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
          Key
        </div>
        {!isTrack && (
          <div className="w-44 flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
            Track
          </div>
        )}
        <div className="min-w-[100px] flex-1 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
          Title
        </div>
        <div className="min-w-[100px] flex-1 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
          Description
        </div>
        {isTrack && (
          <div className="w-40 flex-shrink-0 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink/40">
            Href
          </div>
        )}
        <div className="w-28 flex-shrink-0 px-3 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-ink/40">
          Available
        </div>
        <div className="w-40 flex-shrink-0 px-4 py-2" />
      </div>

      {/* Rows */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-ink/10 px-4 py-4"
          >
            <div
              className="h-3 flex-1 animate-pulse rounded bg-ink/10"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          </div>
        ))
      ) : features.length === 0 ? (
        <div className="px-3 py-8 text-center text-[13px] text-ink/30">
          No {type}s yet
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={features.map((f) => f._id)}
            strategy={verticalListSortingStrategy}
          >
            {features.map((feature) => (
              <SortableFeatureRow
                key={feature._id}
                feature={feature}
                type={type}
                tracks={tracks}
                canWrite={canWrite}
                onToggleEnabled={onToggleEnabled}
                onSave={onSave}
                onKill={onKill}
                onRestore={onRestore}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Add button */}
      {canWrite && (
        <div className="mt-3">
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-mint px-4 py-1.5 text-[13px] font-medium text-mint transition-colors hover:bg-mint/[0.06]"
          >
            <Plus size={15} />
            Add {type}
          </button>
        </div>
      )}

      <AddFeatureModal
        open={addModalOpen}
        type={type}
        tracks={tracks}
        onClose={() => setAddModalOpen(false)}
        onSubmit={onAdd}
      />
    </div>
  );
}