// Klient modelu językowego. Dostawca do ustalenia (TASKS.md O2), więc protokół zgodny z OpenAI
// `POST /v1/chat/completions` – obsługują go m.in. Ollama, vLLM, LM Studio i bramki do modeli w chmurze.
// Bez konfiguracji: `null` → endpointy używają reguł. Treści zapytań nie logujemy.

export interface LlmClient {
  /** Odpowiedź modelu jako tekst (oczekujemy JSON – parsuje wywołujący). */
  complete(system: string, user: string): Promise<string>;
}

export interface LlmConfig {
  baseUrl: string;
  apiKey?: string;
  model: string;
  timeoutMs: number;
}

/** `LLM_HOST` (np. `http://localhost`), `LLM_PORT`, opcjonalnie `LLM_API_KEY`, `LLM_MODEL`. */
export function llmConfigFromEnv(env: NodeJS.ProcessEnv = process.env): LlmConfig | null {
  const host = env.LLM_HOST?.trim();
  if (!host) return null;
  const withScheme = /^https?:\/\//.test(host) ? host : `http://${host}`;
  const port = env.LLM_PORT?.trim();
  return {
    baseUrl: port ? `${withScheme.replace(/\/+$/, '')}:${port}` : withScheme.replace(/\/+$/, ''),
    apiKey: env.LLM_API_KEY?.trim() || undefined,
    model: env.LLM_MODEL?.trim() || 'default',
    timeoutMs: Number(env.LLM_TIMEOUT_MS ?? 8000),
  };
}

export function createLlmClient(config: LlmConfig | null): LlmClient | null {
  if (!config) return null;
  return {
    async complete(system, user) {
      const res = await fetch(`${config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: config.model,
          temperature: 0,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
        signal: AbortSignal.timeout(config.timeoutMs),
      });
      if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
      const data = (await res.json()) as { choices?: { message?: { content?: unknown } }[] };
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== 'string') throw new Error('LLM: brak treści odpowiedzi');
      return content;
    },
  };
}

/** Wyciąga pierwszy obiekt JSON z odpowiedzi (modele lubią dodać ```json … ```). */
export function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('LLM: odpowiedź bez JSON');
  return JSON.parse(text.slice(start, end + 1));
}
