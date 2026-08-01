import { createHash } from "node:crypto";
import {
  type LanguageModelV1Middleware,
  type LanguageModelV1StreamPart,
} from "ai";

import {
  getModelById,
  getProviderById,
  MODEL_DESIGNATIONS,
} from "@/lib/ai-models";
import type { ServiceName } from "@/lib/types";
import redis from "@/lib/redis";

export const MODEL_UNAVAILABLE_MESSAGE =
  "This model is unavailable; switching to ResumeLM’s fast default.";
export const FAST_DEFAULT_MODEL = MODEL_DESIGNATIONS.FAST_CHEAP_FREE;

const CIRCUIT_TTL_SECONDS = 5 * 60;
const MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 250;

export type AIErrorKind =
  | "missing_api_key"
  | "invalid_model"
  | "payment_required"
  | "exhausted_credits"
  | "authentication"
  | "permission_denied"
  | "transient"
  | "unknown";

export interface AIErrorClassification {
  kind: AIErrorKind;
  retryable: boolean;
  statusCode?: number;
  message: string;
  retryAfterMs?: number;
}

export interface AIProviderContext {
  providerId: ServiceName;
  modelId: string;
  apiKey: string;
  usedServerKey: boolean;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly classification: AIErrorClassification,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function errorText(error: unknown): string {
  if (error instanceof AIProviderError) return error.message;

  const record = asRecord(error);
  const parsedResponse = parseJson(record?.responseBody);
  const parsedData = parseJson(record?.data);
  const values = [
    error instanceof Error ? error.message : undefined,
    record?.message,
    record?.code,
    record?.type,
    record?.error_type,
    record?.error,
    parsedResponse,
    parsedData,
  ];

  return values
    .filter(value => value !== undefined && value !== null)
    .map(value => (typeof value === "string" ? value : JSON.stringify(value)))
    .join(" ")
    .toLowerCase();
}

function errorStatus(error: unknown): number | undefined {
  const record = asRecord(error);
  const statusCode = record?.statusCode ?? record?.status;
  return typeof statusCode === "number" ? statusCode : undefined;
}

function retryAfterMs(error: unknown): number | undefined {
  const record = asRecord(error);
  const headers = record?.responseHeaders;
  if (!headers || typeof headers !== "object") return undefined;

  const retryAfter = (headers as Record<string, unknown>)["retry-after"];
  if (typeof retryAfter !== "string" && typeof retryAfter !== "number") {
    return undefined;
  }

  const seconds = Number(retryAfter);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : undefined;
}

export function classifyAIError(error: unknown): AIErrorClassification {
  if (error instanceof AIProviderError) return error.classification;

  const message = errorText(error);
  const statusCode = errorStatus(error);

  if (
    /api key not found|missing api key|no api key|api key is required/.test(message)
  ) {
    return {
      kind: "missing_api_key",
      retryable: false,
      statusCode,
      message,
    };
  }

  if (
    /invalid model|unknown model|model.*(?:not found|does not exist)|no such model|model_not_found|invalid_model|not_found/.test(
      message,
    )
  ) {
    return {
      kind: "invalid_model",
      retryable: false,
      statusCode,
      message,
    };
  }

  if (
    statusCode === 402 ||
    /payment required|payment_required|insufficient credit|credit balance|credits exhausted/.test(
      message,
    )
  ) {
    return {
      kind: "payment_required",
      retryable: false,
      statusCode,
      message,
    };
  }

  if (
    /insufficient_quota|quota|no credits|out of credits|exhausted.*(?:credit|quota)/.test(
      message,
    )
  ) {
    return {
      kind: "exhausted_credits",
      retryable: false,
      statusCode,
      message,
    };
  }

  if (
    statusCode === 401 ||
    /invalid api key|incorrect api key|authentication|unauthorized/.test(message)
  ) {
    return {
      kind: "authentication",
      retryable: false,
      statusCode,
      message,
    };
  }

  if (
    statusCode === 403 ||
    /permission denied|forbidden|access denied/.test(message)
  ) {
    return {
      kind: "permission_denied",
      retryable: false,
      statusCode,
      message,
    };
  }

  const isNetworkFailure =
    /econnreset|econnrefused|enotfound|eai_again|etimedout|network|fetch failed|socket|timed out|timeout/.test(
      message,
    );
  const isTransientStatus =
    statusCode === 408 ||
    statusCode === 429 ||
    (statusCode !== undefined && statusCode >= 500 && statusCode <= 599);

  if (isNetworkFailure || isTransientStatus) {
    return {
      kind: "transient",
      retryable: true,
      statusCode,
      message,
      retryAfterMs: retryAfterMs(error),
    };
  }

  return {
    kind: "unknown",
    retryable: false,
    statusCode,
    message,
  };
}

function publicProviderError(
  error: unknown,
  classification: AIErrorClassification,
): AIProviderError {
  if (error instanceof AIProviderError) return error;

  const message =
    classification.kind === "transient"
      ? "ResumeLM’s AI service is temporarily unavailable. Please try again."
      : MODEL_UNAVAILABLE_MESSAGE;

  return new AIProviderError(message, classification, error);
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export async function retryAIProviderCall<T>(
  operation: () => PromiseLike<T>,
  context: AIProviderContext,
  options: {
    maxAttempts?: number;
    sleep?: (milliseconds: number) => Promise<void>;
  } = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? MAX_ATTEMPTS;
  const wait = options.sleep ?? sleep;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const classification = classifyAIError(error);

      if (!classification.retryable || attempt >= maxAttempts) {
        await recordProviderFailure(context, classification);
        throw publicProviderError(error, classification);
      }

      const backoff =
        classification.retryAfterMs ??
        DEFAULT_RETRY_DELAY_MS * 2 ** (attempt - 1) + Math.floor(Math.random() * 100);
      await wait(backoff);
    }
  }

  throw new Error("AI provider retry loop exited unexpectedly");
}

function circuitKey(context: Pick<AIProviderContext, "providerId" | "apiKey">) {
  const fingerprint = createHash("sha256")
    .update(context.apiKey)
    .digest("hex")
    .slice(0, 20);
  return `ai:circuit:${context.providerId}:${fingerprint}`;
}

interface CircuitState {
  failures: number;
  openedUntil: number;
  lastKind: AIErrorKind;
  lastModelId: string;
}

const memoryCircuit = new Map<string, CircuitState>();

function canUseRedis() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  ) || Boolean(process.env.USE_LOCAL_REDIS === "true" && process.env.REDIS_URL);
}

async function readCircuitState(key: string): Promise<CircuitState | null> {
  const local = memoryCircuit.get(key);
  if (local) {
    if (local.openedUntil > Date.now()) return local;
    memoryCircuit.delete(key);
  }

  if (!canUseRedis()) return null;

  try {
    const remote = await redis.hgetall(key);
    if (!remote?.openedUntil) return null;

    const state: CircuitState = {
      failures: Number(remote.failures ?? 0),
      openedUntil: Number(remote.openedUntil),
      lastKind: (remote.lastKind as AIErrorKind) ?? "unknown",
      lastModelId: remote.lastModelId ?? "",
    };

    if (state.openedUntil <= Date.now()) return null;
    memoryCircuit.set(key, state);
    return state;
  } catch {
    // Provider protection must never turn into an outage because Redis is down.
    return null;
  }
}

function shouldOpenCircuit(kind: AIErrorKind) {
  return (
    kind === "payment_required" ||
    kind === "exhausted_credits" ||
    kind === "authentication" ||
    kind === "permission_denied"
  );
}

export async function recordProviderFailure(
  context: AIProviderContext,
  classification: AIErrorClassification,
): Promise<void> {
  if (!shouldOpenCircuit(classification.kind)) return;

  const key = circuitKey(context);
  const previous = await readCircuitState(key);
  const state: CircuitState = {
    failures: (previous?.failures ?? 0) + 1,
    openedUntil: Date.now() + CIRCUIT_TTL_SECONDS * 1000,
    lastKind: classification.kind,
    lastModelId: context.modelId,
  };

  memoryCircuit.set(key, state);

  if (!canUseRedis()) return;

  try {
    await redis.hset(key, {
      failures: String(state.failures),
      openedUntil: String(state.openedUntil),
      lastKind: state.lastKind,
      lastModelId: state.lastModelId,
    });
    await redis.expire(key, CIRCUIT_TTL_SECONDS);
  } catch {
    // The in-memory state still protects the current server instance.
  }
}

export async function assertProviderCircuitClosed(
  context: AIProviderContext,
): Promise<void> {
  const state = await readCircuitState(circuitKey(context));
  if (!state) return;

  const classification: AIErrorClassification = {
    kind: state.lastKind,
    retryable: false,
    message: `Provider circuit open for ${context.providerId}`,
  };
  throw new AIProviderError(MODEL_UNAVAILABLE_MESSAGE, classification);
}

export function createAIModelReliabilityMiddleware(
  context: AIProviderContext,
): LanguageModelV1Middleware {
  return {
    middlewareVersion: "v1",
    wrapGenerate: ({ doGenerate }) =>
      retryAIProviderCall(doGenerate, context),
    wrapStream: async ({ doStream }) => {
      const result = await retryAIProviderCall(doStream, context);
      const stream = result.stream.pipeThrough(
        new TransformStream<LanguageModelV1StreamPart, LanguageModelV1StreamPart>({
          transform(part, controller) {
            if (part.type === "error") {
              const classification = classifyAIError(part.error);
              void recordProviderFailure(context, classification);
              controller.enqueue({
                ...part,
                error: publicProviderError(part.error, classification),
              });
              return;
            }

            controller.enqueue(part);
          },
        }),
      );

      return { ...result, stream };
    },
  };
}

export interface ModelHealth {
  modelId: string;
  provider: ServiceName | "unknown";
  status: "available" | "unavailable" | "unknown";
  checkedAt: string;
  retryAt?: string;
  message?: string;
  fallbackModelId: string;
}

export async function getModelHealth(modelId: string): Promise<ModelHealth> {
  const model = getModelById(modelId);
  const checkedAt = new Date().toISOString();

  if (!model) {
    return {
      modelId,
      provider: "unknown",
      status: "unavailable",
      checkedAt,
      message: MODEL_UNAVAILABLE_MESSAGE,
      fallbackModelId: FAST_DEFAULT_MODEL,
    };
  }

  const provider = getProviderById(model.provider);
  const apiKey = provider?.envKey ? process.env[provider.envKey]?.trim() : undefined;

  // A missing app key is not globally unhealthy: a BYOK user may still use
  // the provider. The normal request resolver will reject it when no key is
  // available for the current user.
  if (!provider || !apiKey) {
    return {
      modelId: model.id,
      provider: model.provider,
      status: "unknown",
      checkedAt,
      fallbackModelId: FAST_DEFAULT_MODEL,
    };
  }

  const state = await readCircuitState(circuitKey({ providerId: model.provider, apiKey }));
  if (!state) {
    return {
      modelId: model.id,
      provider: model.provider,
      status: "available",
      checkedAt,
      fallbackModelId: FAST_DEFAULT_MODEL,
    };
  }

  return {
    modelId: model.id,
    provider: model.provider,
    status: "unavailable",
    checkedAt,
    retryAt: new Date(state.openedUntil).toISOString(),
    message: MODEL_UNAVAILABLE_MESSAGE,
    fallbackModelId: FAST_DEFAULT_MODEL,
  };
}

/** Test-only reset without touching Redis. */
export function clearInMemoryAIHealthCache(): void {
  memoryCircuit.clear();
}
