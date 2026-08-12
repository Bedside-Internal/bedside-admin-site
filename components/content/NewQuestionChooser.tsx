"use client";

interface NewQuestionChooserProps {
    canWrite: boolean;
    canAiWrite: boolean;
    onChooseWrite: () => void;
    onChooseGenerate: () => void;
    onCancel: () => void;
}

export function NewQuestionChooser({
    canWrite,
    canAiWrite,
    onChooseWrite,
    onChooseGenerate,
    onCancel,
}: NewQuestionChooserProps) {
    const aiDisabled = !canWrite || !canAiWrite;

    return (
        <div>
            <label className="text-xs font-semibold tracking-wider text-mint-600">
                NEW QUESTION
            </label>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={onChooseWrite}
                    disabled={!canWrite}
                    className="rounded-lg border border-ink/10 p-6 text-left transition hover:border-mint-400 hover:bg-mint-50/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <p className="font-poppins text-lg font-bold text-ink-900">
                        Write it myself
                    </p>
                    <p className="mt-1 text-sm text-ink/50">
                        Fill in scenario, guidance, model answer and rubric directly.
                    </p>
                </button>
                <button
                    type="button"
                    onClick={onChooseGenerate}
                    disabled={aiDisabled}
                    className="rounded-lg border border-ink/10 p-6 text-left transition hover:border-mint-400 hover:bg-mint-50/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <p className="font-poppins text-lg font-bold text-ink-900">
                        Generate with AI
                    </p>
                    <p className="mt-1 text-sm text-ink/50">
                        Pick a model and a topic, then review and edit before publishing.
                    </p>
                    {aiDisabled && canWrite && (
                        <p className="mt-2 text-xs text-coral-500">
                            Requires AI generation permission.
                        </p>
                    )}
                    {aiDisabled && !canWrite && (
                        <p className="mt-2 text-xs text-coral-500">
                            Requires content write permission.
                        </p>
                    )}
                </button>
            </div>
            <div className="mt-6 text-center">
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-sm text-mint-600 hover:text-mint-700"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}