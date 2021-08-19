import { doSpeechSynth, language, speechVolume, speechVoice, speechSpeed } from './store.js';
import { languageNameCode, AllVoices } from './constants.js';

export function speak(text, volume=0) {
  // speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume || speechVolume.get();
  utterance.voice = AllVoices[speechSynthesis.getVoices().find(v => v.name == speechVoice.get())];
  utterance.rate = speechSpeed.get();
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
