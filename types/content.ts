export interface Format {
    id: string;
    trackId: string | null;
    slug: string;
    title: string;
    subtitle: string | null;
    iconKey: string | null;
    killed: boolean;
    killReason: string | null;
    killedAt: string | null;
    killedBy: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Dimension {
    id: string;
    formatId: string;
    label: string;
    slug: string;
    subtitle: string | null;
    iconKey: string | null;
    sortOrder: number;
    killed: boolean;
    killReason: string | null;
    killedAt: string | null;
    killedBy: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Section {
    id: string;
    formatId: string;
    dimensionId: string | null;
    title: string;
    slug: string;
    subtitle: string | null;
    iconKey: string | null;
    sortOrder: number;
    killed: boolean;
    killReason: string | null;
    killedAt: string | null;
    killedBy: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface QuestionListItem {
    id: string;
    formatTitle: string;
    sectionTitle: string;
    difficulty: "easy" | "medium" | "hard";
    isActive: boolean;
    hasScenario: boolean;
    rubricDimensionCount: number;
}

export interface ScoringRubricDimension {
    label: string;
    weight: number;
}

export interface ScoringRubric {
    dimensions: ScoringRubricDimension[];
}

export interface Question {
    id: string;
    sectionId: string;
    sectionTitle: string;
    formatId: string;
    formatTitle: string;
    difficulty: "easy" | "medium" | "hard";
    isActive: boolean;
    scenarioText: string;
    guidanceNote: string;
    modelAnswer: string;
    scoringRubric: ScoringRubric;
    createdAt: string;
    updatedAt: string;
}

export interface CreateQuestionInput {
    sectionId: string;
    difficulty: "easy" | "medium" | "hard";
    isActive: boolean;
    scenarioText: string;
    guidanceNote: string;
    modelAnswer: string;
    scoringRubric: ScoringRubric;
    responseMode?: "written" | "video";
    readingTimeSeconds?: number;
    responseTimeSeconds?: number | null;
    stationType?: string;
    competencyTags?: string[];
    source: "manual" | "ai_generated";
    aiModel?: string;
}

export interface AiModel {
    id: string;
    name: string;
    contextLength?: number;
    pricing?: {
        prompt: string;
        completion: string;
    };
}

export interface AiCredits {
    available: boolean;
    balanceUsd?: number;
    limitUsd?: number;
    usedUsd?: number;
}

export interface AiGeneratedDraft {
    scenario_text: string;
    guidance_note: string;
    model_answer: string;
    scoring_rubric: {
        dimensions: { label: string; weight: number }[];
    };
}

export interface AiGenerateQuestionResponse {
    sectionId: string;
    difficulty: string;
    model: string;
    draft: AiGeneratedDraft;
}