import type { AvailableLanguageCodes, IframeTranslatorClient } from 'iframe-translator';
import { isLiveTL } from './chat-constants';

const REQUEST_TYPE = 'hc-ltl-translate-request';
const RESPONSE_TYPE = 'hc-ltl-translate-response';
const REQUEST_TIMEOUT_MS = 10000;

let requestCounter = 0;

type LiveTLTranslateRequest = {
  type: typeof REQUEST_TYPE;
  messageId: string;
  text: string;
  targetLanguage: AvailableLanguageCodes;
};

type LiveTLTranslateResponse = {
  type: typeof RESPONSE_TYPE;
  messageId: string;
  text: string;
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return value != null && typeof value === 'object';
};

export const shouldUseLiveTLTranslatorBridge = (): boolean => {
  return isLiveTL &&
    navigator.userAgent.includes('Firefox') &&
    window.parent !== window;
};

export const isLiveTLTranslateRequest = (value: unknown): value is LiveTLTranslateRequest => {
  return isObject(value) &&
    value.type === REQUEST_TYPE &&
    typeof value.messageId === 'string' &&
    typeof value.text === 'string' &&
    typeof value.targetLanguage === 'string';
};

const isLiveTLTranslateResponse = (value: unknown): value is LiveTLTranslateResponse => {
  return isObject(value) &&
    value.type === RESPONSE_TYPE &&
    typeof value.messageId === 'string' &&
    typeof value.text === 'string';
};

export const makeLiveTLTranslateResponse = (
  messageId: string,
  text: string
): LiveTLTranslateResponse => {
  return {
    type: RESPONSE_TYPE,
    messageId,
    text
  };
};

export const createLiveTLTranslatorClient = (): IframeTranslatorClient => {
  const callbacks = new Map<string, (text: string) => void>();

  const onMessage = (event: MessageEvent): void => {
    if (!isLiveTLTranslateResponse(event.data)) return;

    const resolve = callbacks.get(event.data.messageId);
    if (resolve == null) return;

    callbacks.delete(event.data.messageId);
    resolve(event.data.text);
  };

  window.addEventListener('message', onMessage);

  return {
    translate: async (
      text: string,
      targetLanguage: AvailableLanguageCodes = 'en'
    ): Promise<string> => {
      const messageId = `hc-ltl-${Date.now()}-${requestCounter++}`;

      return await new Promise((resolve) => {
        const timeout = window.setTimeout(() => {
          callbacks.delete(messageId);
          resolve(text);
        }, REQUEST_TIMEOUT_MS);

        callbacks.set(messageId, (translatedText) => {
          window.clearTimeout(timeout);
          resolve(translatedText);
        });

        window.parent.postMessage({
          type: REQUEST_TYPE,
          messageId,
          text,
          targetLanguage
        }, '*');
      });
    },
    destroy: () => {
      callbacks.clear();
      window.removeEventListener('message', onMessage);
    }
  };
};
