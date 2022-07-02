const audioCtx = new window.AudioContext();
let inputAudioBuffer;

let worker = null;
let processing = false;

function processOnWorker(msg) {
  processing = true;
  const workerInstance = new Worker(location.href + "/worker.js");

  return new Promise((resolve) => {
    workerInstance.onmessage = function (e) {
      console.log("Message received from worker", e.data);
      if ("ready" in e.data) {
        worker = workerInstance;
        worker.postMessage(msg);
      }

      if ("status" in e.data) {
        setStatus(e.data.status);
      }

      if ("progress" in e.data) {
        const progress = e.data.progress;
        const str = `${lastStatusMsg} (${(progress * 100).toFixed(0)}%)`;
        document.getElementById("status").innerText = str;
      }

      if ("channelBuffers" in e.data) {
        const { channelBuffers } = e.data;
        const buffer = audioCtx.createBuffer(inputAudioBuffer.numberOfChannels, channelBuffers[0].length, inputAudioBuffer.sampleRate);
        channelBuffers.forEach((buf, i) => buffer.copyToChannel(buf, i));
        processing = false;
        resolve(buffer);
      }

      if ("wavData" in e.data) {
        const { wavData } = e.data;
        processing = false;
        resolve(wavData);
      }
    };
  });
}

function setEnabledFields(fields) {
  const list = ["file", "pitch", "tempo", "processAndExport", "processAndPlay", "playOriginal", "stop"];
  list.forEach((field) => {
    document.getElementById(field).disabled = !fields.includes(field);
  });

  if (window.AudioEncoder === undefined) {
    document.getElementById("processAndExport").disabled = true;
  }
}

setEnabledFields(["file"]);

let lastStatusMsg = "";
function setStatus(msg) {
  lastStatusMsg = msg;
  document.getElementById("status").innerText = msg;
}

function onNewFile(fileEl) {
  setEnabledFields([]);
  setStatus("Loading file...");
  const file = fileEl.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const arrBuf = event.target.result;
    source = audioCtx.createBufferSource();
    audioCtx.decodeAudioData(
      arrBuf,
      (audioBuffer) => {
        setEnabledFields(["pitch", "tempo", "processAndExport", "processAndPlay", "playOriginal"]);
        setStatus("");
        inputAudioBuffer = audioBuffer;
      },
      (e) => {
        setEnabledFields(["file"]);
        setStatus("Error with decoding audio data");
      }
    );
  };
  reader.readAsArrayBuffer(file);
}

function onChangePitch(rangeEl) {
  document.getElementById("pitchLabel").innerText = Number(rangeEl.value);
}

function onChangeTempo(rangeEl) {
  document.getElementById("tempoLabel").innerText = `${(Number(rangeEl.value) * 100).toFixed(0)}%`;
}

let currentlyPlayingSource = null;

function playBuffer(audioBuffer) {
  if (currentlyPlayingSource) {
    currentlyPlayingSource.stop();
    currentlyPlayingSource = null;
  }

  if (audioBuffer) {
    currentlyPlayingSource = audioCtx.createBufferSource();
    currentlyPlayingSource.buffer = audioBuffer;

    currentlyPlayingSource.connect(audioCtx.destination);
    currentlyPlayingSource.loop = true;
    currentlyPlayingSource.start();
    document.getElementById("stop").disabled = false;
  }
}

function makeWorkerMessage({ askWav } = {}) {
  const tempo = Number(document.getElementById("tempo").value);
  const pitch = Number(document.getElementById("pitch").value);
  const pitchSemitones = Math.pow(2, pitch / 12);

  const channelBuffers = [];
  for (let channel = 0; channel < inputAudioBuffer.numberOfChannels; channel++) {
    channelBuffers.push(inputAudioBuffer.getChannelData(channel));
  }

  return {
    channelBuffers,
    sampleRate: inputAudioBuffer.sampleRate,
    pitch: pitchSemitones,
    tempo,
    ...(askWav ? { wav: true } : {}),
  };
}

async function processAndPlay() {
  setEnabledFields(["stop"]);
  setStatus("Initializing...");

  const start = performance.now();
  const msg = makeWorkerMessage();
  const audioBuffer = await processOnWorker(msg);
  const timeMs = performance.now() - start;

  setStatus(`Finished processing in ${(timeMs / 1000).toFixed(3)} seconds.`);
  playBuffer(audioBuffer);
}

async function processAndExport() {
  setEnabledFields(["stop"]);
  setStatus("Initializing...");

  const start = performance.now();
  const msg = makeWorkerMessage({ askWav: true });
  const wavBuffer = await processOnWorker(msg);
  console.log(wavBuffer);
  const timeMs = performance.now() - start;

  const filename = "audio.wav";
  const blob = new Blob([wavBuffer], { type: "audio/wav" });
  const link = document.createElement("a");
  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }, 100);

  setStatus(`Finished processing in ${(timeMs / 1000).toFixed(3)} seconds.`);
  setEnabledFields(["pitch", "tempo", "processAndExport", "processAndPlay", "playOriginal"]);
}

function playOriginal() {
  setStatus("Playing...");
  setEnabledFields(["stop"]);
  playBuffer(inputAudioBuffer);
}

async function stop() {
  if (processing) {
    setEnabledFields([]);
    processing = false;
    if (worker) {
      worker.terminate();
    }
  }

  setStatus("");
  setEnabledFields(["pitch", "tempo", "processAndExport", "processAndPlay", "playOriginal"]);
  if (currentlyPlayingSource) {
    currentlyPlayingSource.stop();
    currentlyPlayingSource = null;
  }
}
