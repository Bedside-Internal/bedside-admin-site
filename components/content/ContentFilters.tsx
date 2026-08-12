"use client";

interface ContentFiltersProps {
    formats: { slug: string; title: string }[];
    visibleSections: { slug: string; title: string }[];
    selectedFormat: string;
    selectedSection: string;
    selectedDifficulty: string;
    onFormatChange: (slug: string) => void;
    onSectionChange: (slug: string) => void;
    onDifficultyChange: (d: string) => void;
}

export function ContentFilters({
    formats,
    visibleSections,
    selectedFormat,
    selectedSection,
    selectedDifficulty,
    onFormatChange,
    onSectionChange,
    onDifficultyChange,
}: ContentFiltersProps) {
    return (
        <div className="flex items-center gap-3">
            <select
                value={selectedFormat}
                onChange={(e) => {
                    onFormatChange(e.target.value);
                    onSectionChange("");
                }}
                className="rounded-md border border-ink/10 bg-sand/60 px-3 py-2 text-sm outline-none focus:border-mint-500"
            >
                <option value="">All formats</option>
                {formats.map((f) => (
                    <option key={f.slug} value={f.slug}>
                        {f.title}
                    </option>
                ))}
            </select>
            <select
                value={selectedSection}
                onChange={(e) => onSectionChange(e.target.value)}
                className="rounded-md border border-ink/10 bg-sand/60 px-3 py-2 text-sm outline-none focus:border-mint-500"
            >
                <option value="">All sections</option>
                {visibleSections.map((s) => (
                    <option key={s.slug} value={s.slug}>
                        {s.title}
                    </option>
                ))}
            </select>
            <select
                value={selectedDifficulty}
                onChange={(e) => onDifficultyChange(e.target.value)}
                className="rounded-md border border-ink/10 bg-sand/60 px-3 py-2 text-sm outline-none focus:border-mint-500"
            >
                <option value="">All difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>
    );
}