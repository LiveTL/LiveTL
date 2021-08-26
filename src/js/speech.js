import { doSpeechSynth, language, speechVolume } from './store.js';
import { languageNameCode } from './constants.js';

export function speak(text, volume = 0) {
  // speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume || speechVolume.get();
  utterance.lang = languageNameCode[language.get()].tag;
  speechSynthesis.speak(utterance);
}

export function checkAndSpeak(text) {
  if (doSpeechSynth.get()) {
    speak(text);
  }
}

setTimeout(() => {
  let isInitial = true;
  doSpeechSynth.subscribe($doSpeechSynth => {
    if (isInitial || !$doSpeechSynth) {
      isInitial = false;
      return;
    }
    speak('Speech synthesis enabled');
  });
}, 0);
