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

// TODO: Allow user to upload Audio

let audio = new Audio("./sample/In My Clouds.mp3");
let audioSrc = audioCtx.createMediaElementSource(audio);
audioSrc.connect(analyser);
analyser.connect(audioCtx.destination);

let bufferSize = analyser.frequencyBinCount;
let frequencyData = new Float32Array(bufferSize);

// get init frequency data and stores in Float32Array
analyser.getFloatFrequencyData(frequencyData);

audio.addEventListener("ended", () => {
  audio.currentTime = 0;
});

let mapsArr = [];
// TODO: Allow user to set frequencyBinSelection
let frequencyBinSelection = [0, 100, 256, 300, 400];

for (let i = 0; i < frequencyBinSelection.length; i++) {
  mapsArr.push(new Map());
}

Plotly.plot("vizDiv", getData(0, mapsArr, frequencyData), {
  title: "Audio Frequency Analyser",
  autosize: true,
  xaxis: {
    title: "Seconds",
    range: [0, Math.round(audio.duration)]
  },
  yaxis: {
    title: "Frequency Data"
  }
});

function render() {
  requestAnimationFrame(render);

  // get real time frequency data and stores in Float32Array
  analyser.getFloatFrequencyData(frequencyData);

  let currentTime = Math.round(audio.currentTime);
  let data = getData(currentTime, mapsArr, frequencyData);

  // Reformat Data for Plotly.extendTraces
  let newData = { x: [], y: [] };
  let arrs = [];

  for (let i = 0; i < data.length; i++) {
    newData.x.push([data[i].x[data[i].x.length - 1]]);
    newData.y.push([data[i].y[data[i].y.length - 1]]);
    arrs.push(i);
  }

  Plotly.relayout("vizDiv", {
    xaxis: {
      range: [0, Math.round(audio.duration)]
    },
    autosize: true
  });

  Plotly.extendTraces("vizDiv", newData, arrs);
}

function getData(time, maps, frequencyData) {
  let data = [];

  maps.forEach((map, index) => {
    let d = frequencyData[frequencyBinSelection[index]];

    if (map.get(time) === undefined) {
      map.set(time, d);
    }

    let x = [];
    let y = [];

    map.forEach((value, key) => {
      if (value !== -Infinity) {
        y.push(value);
        x.push(key);
      }
    });

    let trace = {
      x,
      y,
      type: "scatter",
      name: `Bin:${frequencyBinSelection[index]}`
    };

    data.push(trace);
  });
  return data;
}

render();

// TODO: add function to start music

document.body.onkeyup = function(e) {
  if (e.keyCode == 32) {
    audio.paused ? audio.play() : audio.pause();
  }
};
