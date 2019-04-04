// Web Audio API Setup
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();

document.addEventListener("DOMContentLoaded", function() {
  var elems = document.querySelectorAll(".tooltipped");
  var instances = M.Tooltip.init(elems);
});

const slider = document.querySelector("#slider");
document.querySelector(".buffer").innerText = slider.value;
let sliderValue = slider.value * 2;
analyser.fftSize = sliderValue;

let bufferSize;

const input = document.querySelector("#audio-upload");
const sampleBtn = document.querySelector(".sample-btn");

// defalut sample track
sampleBtn.addEventListener("click", () => {
  if (frequencyBinSelection.length <= 0) {
    return;
  }
  init("./sample/In My Clouds.mp3");
});

input.addEventListener("change", e => {
  if (frequencyBinSelection.length <= 0) {
    return;
  }
  audioFilePath = URL.createObjectURL(e.target.files[0]);
  init(audioFilePath);
});

// default frequencyBinSelection
let frequencyBinSelection = [0, 5, 10, 50, 100, 200, 300, 400, 500];

const binBtn = document.querySelector("#bin-btn");
const binBtnRemove = document.querySelector("#bin-remove");
const binBtnClear = document.querySelector("#bin-clear");
const binVal = document.querySelector("#bin-text");

slider.addEventListener("change", () => {
  sliderValue = slider.value * 2;
  analyser.fftSize = sliderValue;
  bufferSize = analyser.frequencyBinCount;
  binVal.min = 0;
  binVal.max = slider.value;
  document.querySelector(".buffer").innerText = bufferSize;
});

binBtn.addEventListener("click", () => {
  let val = parseInt(binVal.value);
  if (isNaN(val)) {
    binVal.value = null;
    return;
  }
  if (val >= 0 && val <= slider.value) {
    if (!frequencyBinSelection.includes(val)) {
      frequencyBinSelection.push(val);
      binVal.value = null;
    }
    document.querySelector(
      ".bin-selection"
    ).innerText = frequencyBinSelection.sort((a, b) => a - b);
  } else {
    binVal.value = null;
    return;
  }
});

binBtnRemove.addEventListener("click", () => {
  let val = parseInt(binVal.value);
  if (isNaN(val)) {
    binVal.value = null;
    return;
  }
  if (frequencyBinSelection.includes(val)) {
    let pos = frequencyBinSelection.indexOf(val);
    if (pos > -1) {
      frequencyBinSelection.splice(pos, 1);
      binVal.value = null;
    }
  }
  document.querySelector(
    ".bin-selection"
  ).innerText = frequencyBinSelection.sort((a, b) => a - b);
});

binBtnClear.addEventListener("click", () => {
  binVal.value = null;
  frequencyBinSelection = [];
  document.querySelector(
    ".bin-selection"
  ).innerText = frequencyBinSelection.sort((a, b) => a - b);
});

function init(audioFilePath) {
  // Resume audio context
  audioCtx.resume();

  const playBtn = document.querySelector(".play-btn");

  if (playBtn.classList.contains("disabled")) {
    playBtn.classList.remove("disabled");
  }

  let audio = new Audio(audioFilePath);
  let audioSrc = audioCtx.createMediaElementSource(audio);
  audioSrc.connect(analyser);
  analyser.connect(audioCtx.destination);

  bufferSize = analyser.frequencyBinCount;
  let frequencyData = new Float32Array(bufferSize);

  slider.addEventListener("change", () => {
    audio.pause();
    audio.currentTime = 0;
    playBtn.children[0].innerText = "play_arrow";
    playBtn.children[1].innerText = "Play";

    sliderValue = slider.value * 2;
    analyser.fftSize = sliderValue;
    bufferSize = analyser.frequencyBinCount;
    frequencyData = new Float32Array(bufferSize);
  });

  // get init frequency data and stores in Float32Array
  analyser.getFloatFrequencyData(frequencyData);

  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    playBtn.children[0].innerText = "play_arrow";
    playBtn.children[1].innerText = "Play";
  });

  let mapsArr = [];

  for (let i = 0; i < frequencyBinSelection.length; i++) {
    mapsArr.push(new Map());
  }

  Plotly.plot("vizDiv", getData(0, mapsArr, frequencyData), {
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

    if (audio.paused) {
      return;
    }

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

    drawGraph(audio, newData, arrs);
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

  audio.onloadedmetadata = () => {
    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        playBtn.children[0].innerText = "pause";
        playBtn.children[1].innerText = "Pause";
        slider.disabled = true;
      } else {
        audio.pause();
        playBtn.children[0].innerText = "play_arrow";
        playBtn.children[1].innerText = "Play";
      }
    });
  };
}

function drawGraph(audio, data, arrs) {
  Plotly.relayout("vizDiv", {
    xaxis: {
      range: [0, Math.round(audio.duration)]
    },
    autosize: true
  });

  Plotly.extendTraces("vizDiv", data, arrs);
}
