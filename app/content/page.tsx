"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import AdminNav from "@/components/layout/AdminNav";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useContent } from "@/components/content/useContent";
import { useAiGeneration } from "@/components/content/useAiGeneration";
import { ContentFilters } from "@/components/content/ContentFilters";
import { ContentTable } from "@/components/content/ContentTable";
import { FormatsSectionsPanel } from "@/components/content/FormatsSectionsPanel";
import { NewQuestionChooser } from "@/components/content/NewQuestionChooser";
import { WriteQuestionForm } from "@/components/content/WriteQuestionForm";
import { GenerateQuestionForm } from "@/components/content/GenerateQuestionForm";
import SubmittedQuestionsContent from "@/components/content/SubmittedQuestionsContent";
import { useUserSubmittedQuestions } from "@/hooks/useUserSubmittedQuestions";
import type { CreateQuestionInput } from "@/types/content";
import type { UserSubmittedQuestionAdmin } from "@/types/marketing";

type Tab = "questions" | "submissions";
type View = "list" | "chooser" | "write" | "generate" | "review";

export default function ContentPage() {
  const { isLoaded } = useAuth();
  const { can, isLoading: permsLoading } = useAdminPermissions();
  const searchParams = useSearchParams();

  /*  ALL HOOKS MUST BE DECLARED BEFORE ANY EARLY RETURNS  */

  const content = useContent();
  const ai = useAiGeneration();
  const submissions = useUserSubmittedQuestions();

  const [tab, setTab] = useState<Tab>("questions");
  const [view, setView] = useState<View>("list");
  const [showManage, setShowManage] = useState(false);

  const [filterFormat, setFilterFormat] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  const [aiDraftMeta, setAiDraftMeta] = useState<{
    sectionId: string;
    difficulty: "easy" | "medium" | "hard";
    model: string;
    actualCost?: { promptTokens: number; completionTokens: number; totalUsd: number };
  } | null>(null);
  const [aiDraftData, setAiDraftData] = useState<{
    scenarioText: string;
    guidanceNote: string;
    modelAnswer: string;
    rubricDimensions: { label: string; weight: number }[];
  } | null>(null);

  // Deep-link prefill from submission approval
  const [prefillSubmission, setPrefillSubmission] = useState<UserSubmittedQuestionAdmin | null>(null);

  useEffect(() => {
    const prefill = searchParams.get("prefill");
    if (prefill?.startsWith("submission:")) {
      const submissionId = prefill.slice("submission:".length);
      const submission = submissions.items.find((s) => s.id === submissionId);
      if (submission) {
        setPrefillSubmission(submission);
        setView("write");
      }
    }
  }, [searchParams, submissions.items]);

  const formatOptions = useMemo(
    () => content.formats.filter((f) => !f.killed),
    [content.formats],
  );

  const visibleSections = useMemo(() => {
    const active = content.sections.filter((s) => !s.killed);
    if (!filterFormat) return active;
    const fmt = content.formats.find((f) => f.slug === filterFormat);
    if (!fmt) return active;
    return active.filter((s) => s.formatId === fmt.id);
  }, [filterFormat, content.formats, content.sections]);

  useEffect(() => {
    content.fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (content.loading) return;
    content.fetchQuestions({
      formatSlug: filterFormat || undefined,
      sectionSlug: filterSection || undefined,
      difficulty: filterDifficulty || undefined,
    });
  }, [filterFormat, filterSection, filterDifficulty, content.loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (view === "generate" && can("ai_generation", "read")) {
      ai.fetchModels();
      ai.fetchCredits();
    }
  }, [view, can]); // eslint-disable-line react-hooks/exhaustive-deps

  /*  Handlers */

  const handleCancel = () => {
    setView("list");
    setAiDraftMeta(null);
    setAiDraftData(null);
    ai.clearDraft();
  };

  const handleChooseWrite = () => {
    setAiDraftMeta(null);
    setAiDraftData(null);
    setView("write");
  };

  const handleChooseGenerate = () => {
    ai.clearDraft();
    setView("generate");
  };

  const handleGenerate = async (data: {
    sectionId: string;
    difficulty: string;
    model: string;
    topic: string;
  }) => {
    const result = await ai.generate(data);
    if (result) {
      setAiDraftMeta({
        sectionId: result.sectionId,
        difficulty: result.difficulty as "easy" | "medium" | "hard",
        model: result.model,
        actualCost: result.actualCost,
      });
      setAiDraftData({
        scenarioText: result.draft.scenario_text,
        guidanceNote: result.draft.guidance_note,
        modelAnswer: result.draft.model_answer,
        rubricDimensions: result.draft.scoring_rubric.dimensions,
      });
      setView("review");
    }
  };

  const handleCreateQuestion = async (data: CreateQuestionInput) => {
    await content.createQuestion(data);
    await content.fetchQuestions({
      formatSlug: filterFormat || undefined,
      sectionSlug: filterSection || undefined,
      difficulty: filterDifficulty || undefined,
    });
    setView("list");
    setAiDraftMeta(null);
    setAiDraftData(null);
  };

  /*  Derived render state  */

  const showList = view === "list" || view === "chooser";
  const showManagePanel = showManage && showList;
  const activeError = content.error || ai.error;

  /*  Auth / perms gates (now safely AFTER all hooks) ─ */

  if (!isLoaded || permsLoading) {
    return (
      <>
        <AdminNav />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-mint-500 border-t-transparent" />
          </div>
        </main>
      </>
    );
  }

  if (!can("content", "read")) {
    return (
      <>
        <AdminNav />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="font-poppins text-lg font-bold text-coral-500">
                Access denied
              </p>
              <p className="mt-1 text-sm text-ink/50">
                You don&apos;t have permission to view content management.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  /*  Main render ─ */

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Dismissible error banner */}
        {activeError && (
          <div className="mb-6 flex items-start justify-between rounded-lg border border-coral-200 bg-coral-50 px-4 py-3">
            <p className="text-sm text-coral-700">{activeError}</p>
            <button
              type="button"
              onClick={() => {
                content.dismissError();
                ai.dismissError();
              }}
              className="ml-4 shrink-0 text-coral-400 hover:text-coral-600"
            >
              ✕
            </button>
          </div>
        )}

        {/*  Page header  */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-poppins text-2xl font-bold">
              Content Management
            </h1>
            <p className="mt-1 text-sm text-ink/50">
              Manage questions, formats, sections and dimensions.
            </p>
          </div>
        </div>

        {/*  Tab bar  */}
        <div className="mt-4 flex gap-6 border-b border-ink/10">
          {[
            { key: "questions" as Tab, label: "Question Bank" },
            { key: "submissions" as Tab, label: "Submitted Questions", badge: submissions.items.filter((i) => i.visibility === "pending").length > 0 ? submissions.items.filter((i) => i.visibility === "pending").length : undefined },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setView("list");
              }}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-2.5 text-sm font-medium transition-colors ${tab === t.key
                ? "border-mint text-ink"
                : "border-transparent text-ink/40 hover:text-ink/70"
                }`}
            >
              {t.label}
              {t.badge !== undefined && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber px-1.5 text-[11px] font-bold text-ink">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "questions" && (
          <>
            {showList && (
              <div className="mt-2 flex items-center gap-4">
                {can("content", "write") && (
                  <button
                    type="button"
                    onClick={() => setView("chooser")}
                    className="rounded-md border border-mint-500 px-4 py-2 text-sm font-medium text-mint-600 hover:bg-mint-50"
                  >
                    + New question
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowManage((p) => !p)}
                  className="text-sm text-mint-600 hover:text-mint-700"
                >
                  {showManage ? "Hide formats & sections" : "Manage formats & sections"}
                </button>
              </div>
            )}
          </>
        )}

        {/*  Manage panel (inline, persists under chooser)  */}
        {showManagePanel && tab === "questions" && (
          <div className="mt-8">
            <FormatsSectionsPanel
              formats={content.formats}
              dimensions={content.dimensions}
              sections={content.sections}
              canDelete={can("content", "delete")}
              onUpsertFormat={content.upsertFormat}
              onKillFormat={content.killFormat}
              onRestoreFormat={content.restoreFormat}
              onUpsertDimension={content.upsertDimension}
              onKillDimension={content.killDimension}
              onRestoreDimension={content.restoreDimension}
              onUpsertSection={content.upsertSection}
              onKillSection={content.killSection}
              onRestoreSection={content.restoreSection}
            />
          </div>
        )}

        {/*  Question Bank tab content  */}
        {tab === "questions" && (
          <>
            {/*  List view  */}
            {view === "list" && (
              <div className="mt-8">
                {content.loading ? (
                  <div className="flex h-48 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-mint-500 border-t-transparent" />
                  </div>
                ) : (
                  <>
                    <ContentFilters
                      formats={formatOptions}
                      visibleSections={visibleSections}
                      selectedFormat={filterFormat}
                      selectedSection={filterSection}
                      selectedDifficulty={filterDifficulty}
                      onFormatChange={(slug) => {
                        setFilterFormat(slug);
                        setFilterSection("");
                      }}
                      onSectionChange={setFilterSection}
                      onDifficultyChange={setFilterDifficulty}
                    />
                    <div className="mt-4">
                      <ContentTable
                        questions={content.questions}
                        onToggleActive={(id, isActive) => {
                          if (can("content", "write")) {
                            content.toggleQuestionActive(id, isActive);
                          }
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/*  Chooser  */}
            {view === "chooser" && (
              <div className="mt-8">
                <NewQuestionChooser
                  canWrite={can("content", "write")}
                  canAiWrite={can("ai_generation", "write")}
                  onChooseWrite={handleChooseWrite}
                  onChooseGenerate={handleChooseGenerate}
                  onCancel={handleCancel}
                />
              </div>
            )}

            {/*  Write-myself form  */}
            {view === "write" && (
              <div className="mt-8">
                <WriteQuestionForm
                  formats={content.formats}
                  sections={content.sections}
                  dimensions={content.dimensions}
                  initialData={prefillSubmission
                    ? {
                      scenarioText: prefillSubmission.questionText,
                      guidanceNote: `Category: ${prefillSubmission.categoryText}`,
                      modelAnswer: "",
                      rubricDimensions: [],
                    }
                    : undefined}
                  initialMeta={prefillSubmission
                    ? {
                      sectionId: prefillSubmission.formatId ?? undefined,
                      difficulty: "easy" as const,
                      source: "manual" as const,
                    }
                    : undefined}
                  onSubmit={handleCreateQuestion}
                  onCancel={handleCancel}
                />
              </div>
            )}

            {/*  Generate-with-AI form  */}
            {view === "generate" && (
              <div className="mt-8">
                <GenerateQuestionForm
                  formats={content.formats}
                  sections={content.sections}
                  models={ai.models}
                  credits={ai.credits}
                  generating={ai.generating}
                  onGenerate={handleGenerate}
                  onCancel={handleCancel}
                />
              </div>
            )}

            {/* Review AI draft */}
            {view === "review" && aiDraftData && aiDraftMeta && (
              <div className="mt-8">
                {aiDraftMeta.actualCost && (
                  <div className="mb-4 rounded-md border border-mint-200 bg-mint-50 px-4 py-2.5 text-xs text-mint-700">
                    <span className="font-medium">Actual cost: </span>
                    {aiDraftMeta.actualCost.totalUsd < 0.0005 ? "< $0.001" : `$${aiDraftMeta.actualCost.totalUsd.toFixed(3)}`}
                    <span className="text-mint-600">
                      {" "}({aiDraftMeta.actualCost.promptTokens.toLocaleString()} in / {aiDraftMeta.actualCost.completionTokens.toLocaleString()} out tokens)
                    </span>
                  </div>
                )}
                <WriteQuestionForm
                  formats={content.formats}
                  sections={content.sections}
                  dimensions={content.dimensions}
                  initialData={aiDraftData}
                  initialMeta={{
                    sectionId: aiDraftMeta.sectionId,
                    difficulty: aiDraftMeta.difficulty,
                    source: "ai_generated",
                    aiModel: aiDraftMeta.model,
                  }}
                  onSubmit={handleCreateQuestion}
                  onCancel={handleCancel}
                />
              </div>
            )}
          </>
        )}

        {/*  Submitted Questions tab content  */}
        {tab === "submissions" && (
          <div className="mt-8">
            <SubmittedQuestionsContent
              items={submissions.items}
              loading={submissions.loading}
              error={submissions.error}
              clearError={submissions.clearError}
              pendingActionId={submissions.pendingActionId}
              approve={submissions.approve}
              reject={submissions.reject}
            />
          </div>
        )}
      </main>
    </>
  );
}