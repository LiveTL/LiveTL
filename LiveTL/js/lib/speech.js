import { getSpeechVolume, getStorage } from './storage.js';

// There is no current way to fire a callback on the end of tts
// The async declaration is there for future possible support
export async function speak(text, volume=null) {
  if (speechUnlocked) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume || await getSpeechVolume() || 1;
    speechSynthesis.speak(utterance);
  }
}

export async function shouldSpeak() {
  return await getStorage('speechSynth');
}

export async function checkAndSpeak(text) {
  if (await shouldSpeak()) {
    await speak(text);
  }
}

export function unlockSpeech() {
  speechUnlocked = true;
}

const speechSynthDefault = false;
let speechUnlocked = false;

// module.exports = { checkAndSpeak, shouldSpeak, speak, unlockSpeech };
