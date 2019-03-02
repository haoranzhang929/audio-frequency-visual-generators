// Web Audio API Setup
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;

let audio = new Audio("./sample/In My Clouds.mp3");
let audioSrc = audioCtx.createMediaElementSource(audio);
audioSrc.connect(analyser);
analyser.connect(audioCtx.destination);

let bufferSize = analyser.frequencyBinCount;
let frequencyData = new Float32Array(bufferSize);

analyser.getFloatFrequencyData(frequencyData);

console.log(frequencyData);
