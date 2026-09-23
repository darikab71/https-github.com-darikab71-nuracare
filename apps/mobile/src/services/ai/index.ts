/**
 * NuraCare AI Engine — Secure Backend-Proxied Client
 *
 * All AI calls are routed through the NuraCare Vercel backend (apps/web/api/chat.js).
 * NO API keys are stored or used in the mobile client bundle.
 *
 * Supports:
 *  - SSE streaming (token-by-token progressive rendering)
 *  - Cancel via AbortController
 *  - Exponential backoff retry on network failure
 *  - Graceful fallback on error
 */

const NURACARE_API_BASE = 'https://nuracare.pro.et';

export interface StreamCallbacks {
  onToken: (delta: string) => void;
  onDone: (fullText: string) => void;
  onError: (err: Error) => void;
}

/**
 * Streams a chat response from the NuraCare backend proxy.
 * The backend handles LLM routing, API keys, and safety filtering.
 */
export async function streamChatMessage(
  messages: any[],
  profile: any,
  memoryContext: string | null,
  callbacks: StreamCallbacks,
  abortSignal?: AbortSignal,
): Promise<void> {
  const lang = profile?.langPref === 'Amharic' ? 'am' : profile?.langPref === 'Oromiffa' ? 'om' : 'en';

  let attempt = 0;
  const maxRetries = 2;

  while (attempt <= maxRetries) {
    try {
      const res = await fetch(`${NURACARE_API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, profile, memoryContext, lang }),
        signal: abortSignal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || `API Error: ${res.status}`);
      }

      if (!res.body) throw new Error('No response body (streaming not supported)');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // Keep the incomplete last line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const delta = JSON.parse(data)?.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              callbacks.onToken(delta);
            }
          } catch {
            // Ignore malformed SSE chunk
          }
        }
      }

      callbacks.onDone(fullText);
      return; // Success — exit loop

    } catch (err: any) {
      // Don't retry if the request was intentionally cancelled
      if (err?.name === 'AbortError') {
        callbacks.onError(new Error('Request cancelled'));
        return;
      }

      attempt++;
      if (attempt > maxRetries) {
        callbacks.onError(err instanceof Error ? err : new Error(String(err)));
        return;
      }

      // Exponential backoff: 1s, 2s
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
}

/**
 * Non-streaming fallback for contexts that don't support streaming.
 * Awaits the full response then calls onDone once.
 */
export const ChatEngine = {
  processMessage: async (messages: any[], profile: any, memoryContext?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        reject(new Error('Request timed out after 30 seconds.'));
      }, 30000);

      streamChatMessage(
        messages,
        profile,
        memoryContext ?? null,
        {
          onToken: () => {}, // Discard tokens in non-streaming mode
          onDone: (fullText) => {
            clearTimeout(timeout);
            resolve(fullText || "I'm having trouble processing that right now.");
          },
          onError: (err) => {
            clearTimeout(timeout);
            reject(err);
          },
        },
        controller.signal,
      );
    });
  },
};
