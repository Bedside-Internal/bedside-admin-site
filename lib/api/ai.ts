import type { AiModel, AiCredits, AiGenerateQuestionResponse } from "@/types/content";
import { handleResponse } from "@/lib/api/admin";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/ai`;

function headers(token: string, json = true): HeadersInit {
  const h: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

export function getModels(token: string) {
  return fetch(`${BASE}/models`, { headers: headers(token) }).then((r) =>
    handleResponse<AiModel[]>(r),
  );
}

export function getCredits(token: string) {
  return fetch(`${BASE}/credits`, { headers: headers(token) }).then((r) =>
    handleResponse<AiCredits>(r),
  );
}

export function generateQuestion(
  token: string,
  data: { sectionId: string; difficulty: string; model: string; topic: string },
) {
  return fetch(`${BASE}/generate-question`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(data),
  }).then((r) => handleResponse<AiGenerateQuestionResponse>(r));
}