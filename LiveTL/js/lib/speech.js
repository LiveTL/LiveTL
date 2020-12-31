// There is no current way to fire a callback on the end of tts
// The async declaration is there for future possible support
async function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

async function shouldSpeak() {
  return await getStorage('speechSynth');
}

const speechSynthDefault = false;

