import { createGoogle } from "@ai-sdk/google";

export const DEFAULT_MODEL_ID = "gemini-2.5-flash";

function resolveGoogleApiKey() {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GEMINI_API_KEY
  );
}

const google = createGoogle({
  apiKey: resolveGoogleApiKey(),
});

export const DEFAULT_MODEL = google(DEFAULT_MODEL_ID);

export function getchatModel(modelId?: string | null) {
  const id = modelId?.trim() || DEFAULT_MODEL_ID;
  return google(id);
}