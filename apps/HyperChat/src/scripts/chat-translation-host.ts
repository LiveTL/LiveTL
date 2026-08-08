import { getClient } from 'iframe-translator';
import type { IframeTranslatorClient } from 'iframe-translator';
import { isLiveTLTranslateRequest, makeLiveTLTranslateResponse } from '../ts/ltl-translation';

declare global {
  interface Window {
    __hcLiveTLTranslatorHostRegistered?: boolean;
  }
}

if (!window.__hcLiveTLTranslatorHostRegistered) {
  window.__hcLiveTLTranslatorHostRegistered = true;

  let translatorClientPromise: Promise<IframeTranslatorClient> | null = null;

  const getTranslatorClientAsync = async (): Promise<IframeTranslatorClient> => {
    try {
      translatorClientPromise ??= getClient();
      return await translatorClientPromise;
    } catch (error) {
      translatorClientPromise = null;
      throw error;
    }
  };

  window.addEventListener('message', (event) => {
    if (!isLiveTLTranslateRequest(event.data)) return;
    if (event.source == null) return;

    void (async () => {
      let translatedText = event.data.text;

      try {
        const translatorClient = await getTranslatorClientAsync();
        translatedText = await translatorClient.translate(
          event.data.text,
          event.data.targetLanguage
        );
      } catch (error) {
        console.error('Failed to translate packaged HyperChat message', {
          error,
          request: event.data
        });
      }

      (event.source as Window).postMessage(
        makeLiveTLTranslateResponse(event.data.messageId, translatedText),
        '*'
      );
    })();
  });
}
