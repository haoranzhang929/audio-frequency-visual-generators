// Web Audio API Setup
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
// TODO: Get fftSize from user Input
analyser.fftSize = 1024;

const webAudioUnlock = context => {
  // Audio Context by default is diabled
  // This Function is to unlock its state by listening to a touch/click event
  if (context.state === "suspended" && "ontouchstart" in window) {
    const unlock = () => {
      context.resume().then(() => {
        document.body.removeEventListener("touchstart", unlock);
        document.body.removeEventListener("touchend", unlock);
        document.body.removeEventListener("click", unlock);
      });
    };

    document.body.addEventListener("touchstart", unlock, false);
    document.body.addEventListener("touchend", unlock, false);
    document.body.addEventListener("click", unlock, false);
  }
};
webAudioUnlock(audioCtx);

let audio = new Audio("./sample/In My Clouds.mp3");
let audioSrc = audioCtx.createMediaElementSource(audio);
audioSrc.connect(analyser);
analyser.connect(audioCtx.destination);

let bufferSize = analyser.frequencyBinCount;
let frequencyData = new Float32Array(bufferSize);

analyser.getFloatFrequencyData(frequencyData);

console.log(frequencyData);
