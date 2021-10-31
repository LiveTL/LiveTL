import { doSpeechSynth, language, speechVolume, speechSpeed, speechSpeaker } from './store.js';
import { languageNameCode } from './constants.js';
import { get } from 'svelte/store';

export function speak(text, volume = 0) {
  // speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume || speechVolume.get();
  utterance.voice = get(speechSpeaker);
  utterance.rate = Math.round(speechSpeed.get() * 10) / 10;
  utterance.lang = languageNameCode[language.get()].tag;
  window.speechSynthesis?.speak(utterance);
}

export function checkAndSpeak(text) {
  if (window.speechSynthesis && doSpeechSynth.get()) {
    speak(text);
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
