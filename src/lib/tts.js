export function speakText(text) {
  return new Promise((resolve, reject) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event);
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-speech is not supported in this browser.");
      reject("Speech synthesis not supported");
    }
  });
}