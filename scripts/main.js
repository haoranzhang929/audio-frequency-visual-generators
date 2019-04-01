// Web Audio API Setup
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();

const slider = document.querySelector("#slider");
let sliderValue = slider.value * 2;
analyser.fftSize = sliderValue;

const input = document.querySelector("#audio-upload");
const sampleBtn = document.querySelector(".sample-btn");

// defalut sample track
sampleBtn.addEventListener("click", () => {
  init("./sample/In My Clouds.mp3");
});

input.addEventListener("change", e => {
  audioFilePath = URL.createObjectURL(e.target.files[0]);
  init(audioFilePath);
});

function init(audioFilePath) {
  // Resume audio context
  audioCtx.resume();

  const playBtn = document.querySelector(".play-btn");

  if (playBtn.classList.contains("disabled")) {
    playBtn.classList.remove("disabled");
  }

  slider.disabled = false;

  slider.addEventListener("change", () => {
    audio.pause();
    audio.currentTime = 0;
    playBtn.children[0].innerText = "play_arrow";
    playBtn.children[1].innerText = "Play";

    bufferText.innerText = slider.value;
    sliderValue = slider.value * 2;
    analyser.fftSize = sliderValue;
  });

  let audio = new Audio(audioFilePath);
  let audioSrc = audioCtx.createMediaElementSource(audio);
  audioSrc.connect(analyser);
  analyser.connect(audioCtx.destination);

  let bufferSize = analyser.frequencyBinCount;
  let frequencyData = new Float32Array(bufferSize);

  // get init frequency data and stores in Float32Array
  analyser.getFloatFrequencyData(frequencyData);

  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    playBtn.children[0].innerText = "play_arrow";
    playBtn.children[1].innerText = "Play";
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
