const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

// Models in priority order — newest and most capable first
const MODELS = [
  "gemini-3.1-pro-preview",       // The "Smart" one
  "gemini-3-flash-preview",       // The "Fast" one
  "gemini-3.1-flash-lite-preview" // The "High Quota" one (Recommended)
];

// Track which models are temporarily unavailable and when to retry them
const modelCooldowns = {};
const COOLDOWN_MS = 60 * 1000; // 1 minute cooldown per model

function isModelOnCooldown(model) {
  const cooldownUntil = modelCooldowns[model];
  if (!cooldownUntil) return false;
  if (Date.now() > cooldownUntil) {
    delete modelCooldowns[model];
    return false;
  }
  return true;
}

function setModelCooldown(model) {
  modelCooldowns[model] = Date.now() + COOLDOWN_MS;
  console.warn(`[AI] Model ${model} put on cooldown for 60s`);
}

function isFallbackError(error) {
  const msg = (error?.message || '').toLowerCase();
  const status = error?.status || error?.code || error?.httpStatus || 0;
  const statusStr = String(status);

  return (
    statusStr.includes('429') ||
    statusStr.includes('503') ||
    statusStr.includes('502') ||
    statusStr.includes('500') ||
    msg.includes('429') ||
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('500') ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('rate_limit') ||
    msg.includes('overloaded') ||
    msg.includes('too many requests') ||
    msg.includes('too_many_requests') ||
    msg.includes('unavailable') ||
    msg.includes('service unavailable') ||
    msg.includes('resource_exhausted') ||
    msg.includes('resource exhausted') ||
    msg.includes('service_unavailable') ||
    msg.includes('server error') ||
    msg.includes('internal error') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('deadline exceeded') ||
    msg.includes('deadline_exceeded') ||
    msg.includes('capacity') ||
    msg.includes('temporarily') ||
    msg.includes('try again') ||
    msg.includes('model is overloaded') ||
    msg.includes('model_not_available') ||
    msg.includes('not available') ||
    msg.includes('not found') ||
    msg.includes('model is not available') ||
    msg.includes('preview') ||
    msg.includes('does not exist') ||
    msg.includes('invalid model') ||
    msg.includes('model not found') ||
    msg.includes('unsupported') ||
    msg.includes('deprecated')
  );
}

async function generateResponse(content) {
  let lastError = null;
  let triedCount = 0;

  for (const model of MODELS) {
    // Skip models on cooldown
    if (isModelOnCooldown(model)) {
      console.log(`[AI] Skipping ${model} (on cooldown)`);
      continue;
    }

    try {
      console.log(`[AI] Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: content,
      });

      if (!response || !response.text) {
        throw new Error('Empty response from model');
      }

      console.log(`[AI] Success with model: ${model}`);
      return response.text;

    } catch (error) {
      triedCount++;
      const msg = error?.message || 'Unknown error';

      if (isFallbackError(error)) {
        console.warn(`[AI] Model ${model} unavailable: ${msg.slice(0, 80)}`);
        setModelCooldown(model);
        lastError = error;
        continue;
      }

      // Non-retryable error — throw immediately
      console.error(`[AI] Model ${model} non-retryable error: ${msg}`);
      throw error;
    }
  }

  // All models failed or on cooldown — clear all cooldowns and retry once
  if (triedCount === 0) {
    console.warn('[AI] All models on cooldown — clearing cooldowns and retrying');
    Object.keys(modelCooldowns).forEach(m => delete modelCooldowns[m]);
    return generateResponse(content);
  }

  console.error('[AI] All models exhausted');
  throw new Error(
    lastError?.message?.includes('quota')
      ? 'API quota exceeded. Please try again in a few minutes.'
      : 'All AI models are currently unavailable. Please try again shortly.'
  );
}

async function generateVector(content) {
  const EMBEDDING_MODELS = [
    'gemini-embedding-001',
    'gemini-embedding-exp-03-07',
    'text-embedding-004',
    'text-embedding-005',
  ];

  let lastError = null;

  for (const model of EMBEDDING_MODELS) {
    try {
      console.log(`[AI] Trying embedding model: ${model}`);
      const response = await ai.models.embedContent({
        model,
        contents: content,
        config: {
          outputDimensionality: 768
        }
      });

      if (!response?.embeddings?.[0]?.values) {
        throw new Error('Empty embedding response');
      }

      console.log(`[AI] Embedding success with model: ${model}`);
      return response.embeddings[0].values;

    } catch (error) {
      console.warn(`[AI] Embedding model ${model} failed: ${error?.message}`);
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error('All embedding models failed');
}

module.exports = {
  generateResponse,
  generateVector,
};