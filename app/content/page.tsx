"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import AdminNav from "@/components/layout/AdminNav";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useContent } from "@/components/content/useContent";
import { useAiGeneration } from "@/components/content/useAiGeneration";
import { ContentFilters } from "@/components/content/ContentFilters";
import { ContentTable } from "@/components/content/ContentTable";
import { ManageFormatsSectionsModal } from "@/components/content/ManageFormatsSectionsModal";
import { NewQuestionChooser } from "@/components/content/NewQuestionChooser";
import { WriteQuestionForm } from "@/components/content/WriteQuestionForm";
import { GenerateQuestionForm } from "@/components/content/GenerateQuestionForm";
import SubmittedQuestionsContent from "@/components/content/SubmittedQuestionsContent";
import { useUserSubmittedQuestions } from "@/hooks/useUserSubmittedQuestions";
import type { CreateQuestionInput } from "@/types/content";
import ShareRequestsContent from "@/components/content/ShareRequestsContent";
import { useShareRequests } from "@/hooks/useShareRequests";

export const dynamic = "force-dynamic";

type Tab = "questions" | "submissions" | "shareRequests";
type View = "list" | "chooser" | "write" | "generate" | "review";

function ContentPageInner() {
  const { isLoaded } = useAuth();
  const { can, isLoading: permsLoading } = useAdminPermissions();
  const searchParams = useSearchParams();

  const content = useContent();
  const ai = useAiGeneration();
  const submissions = useUserSubmittedQuestions();
  const shareRequests = useShareRequests();

  const [tab, setTab] = useState<Tab>("questions");
  const [view, setView] = useState<View>("list");
  const [showManageModal, setShowManageModal] = useState(false);

  const [filterFormat, setFilterFormat] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  const [aiDraftMeta, setAiDraftMeta] = useState<{
    sectionId: string;
    difficulty: "easy" | "medium" | "hard";
    model: string;
    actualCost?: { promptTokens: number; completionTokens: number; totalUsd: number };
    sourceSubmissionId?: string;
  } | null>(null);

  const [aiDraftData, setAiDraftData] = useState<{
    scenarioText: string;
    guidanceNote: string;
    modelAnswer: string;
    rubricDimensions: { label: string; weight: number }[];
  } | null>(null);

  // Deep-link prefill from submission approval
  const [prefillGenerate, setPrefillGenerate] = useState<{
    sourceSubmissionId: string;
    sectionId: string;
    topic: string;
  } | null>(null);

  useEffect(() => {
    const prefill = searchParams.get("prefill");
    const sectionId = searchParams.get("sectionId");
    const topic = searchParams.get("topic");
    if (prefill?.startsWith("submission:") && sectionId) {
      const submissionId = prefill.slice("submission:".length);
      setPrefillGenerate({ sourceSubmissionId: submissionId, sectionId, topic: topic ?? "" });
      setView("generate");
    }
  }, [searchParams]);

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
    setPrefillGenerate(null);
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
        sourceSubmissionId: prefillGenerate?.sourceSubmissionId,
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
    setPrefillGenerate(null);
  };

  /*  Derived render state  */

  const showList = view === "list" || view === "chooser";
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
            { key: "shareRequests" as Tab, label: "Share Requests", badge: shareRequests.items.length > 0 ? shareRequests.items.length : undefined },
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
                  onClick={() => setShowManageModal(true)}
                  className="text-sm text-mint-600 hover:text-mint-700"
                >
                  Manage formats & sections
                </button>
              </div>
            )}
          </>
        )}

        <ManageFormatsSectionsModal
          open={showManageModal}
          onClose={() => setShowManageModal(false)}
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
                  initialSectionId={prefillGenerate?.sectionId}
                  initialTopic={prefillGenerate?.topic}
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
                    sourceSubmissionId: aiDraftMeta.sourceSubmissionId,
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
              formats={content.formats}
              sections={content.sections}
            />
          </div>
        )}

        {tab === "shareRequests" && (
          <div className="mt-8">
            <ShareRequestsContent
              items={shareRequests.items}
              loading={shareRequests.loading}
              error={shareRequests.error}
              clearError={shareRequests.clearError}
              pendingActionId={shareRequests.pendingActionId}
              approve={shareRequests.approve}
              reject={shareRequests.reject}
            />
          </div>
        )}
      </main>
    </>
  );
}

export default function ContentPage() {
  return (
    <Suspense
      fallback={
        <>
          <AdminNav />
          <main className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-mint-500 border-t-transparent" />
            </div>
          </main>
        </>
      }
    >
      <ContentPageInner />
    </Suspense>
  );
}