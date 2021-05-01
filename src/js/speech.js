import { doSpeechSynth, speechVolume } from './store.js';

let utterance = null;

export function speak(text, volume=0) {
  speechSynthesis.cancel();
  utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume || speechVolume.get();
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
