import { doSpeechSynth, speechVolume, speechSpeed, speechSpeaker } from './store.js';
import { get } from 'svelte/store';

export function speak(text, langCode, volume = 0) {
  console.debug(`[LiveTL] Speaking: ${text}`);
  // speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume || speechVolume.get();
  utterance.voice = get(speechSpeaker);
  utterance.rate = Math.round(speechSpeed.get() * 10) / 10;
  utterance.lang = langCode;
  window.speechSynthesis?.speak(utterance);
}

export function checkAndSpeak(text) {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (window.speechSynthesis && doSpeechSynth.get()) {
    speak(text.text, text.langCode);
  }
}

setTimeout(() => {
  let isInitial = true;
  doSpeechSynth.subscribe($doSpeechSynth => {
    if (isInitial || !$doSpeechSynth) {
      isInitial = false;
      window.speechSynthesis?.cancel();
      return;
    }
    speak('Speech synthesis enabled');
  });
  speechSpeaker.subscribe(_$speechSpeaker => {
    window.speechSynthesis?.cancel();
  });
}, 0);
