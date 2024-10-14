export enum RubberBandOption {
  RubberBandOptionProcessOffline = 0x00000000,
  RubberBandOptionProcessRealTime = 0x00000001,

  RubberBandOptionStretchElastic = 0x00000000,
  RubberBandOptionStretchPrecise = 0x00000010,

  RubberBandOptionTransientsCrisp = 0x00000000,
  RubberBandOptionTransientsMixed = 0x00000100,
  RubberBandOptionTransientsSmooth = 0x00000200,

  RubberBandOptionDetectorCompound = 0x00000000,
  RubberBandOptionDetectorPercussive = 0x00000400,
  RubberBandOptionDetectorSoft = 0x00000800,

  RubberBandOptionPhaseLaminar = 0x00000000,
  RubberBandOptionPhaseIndependent = 0x00002000,

  RubberBandOptionThreadingAuto = 0x00000000,
  RubberBandOptionThreadingNever = 0x00010000,
  RubberBandOptionThreadingAlways = 0x00020000,

  RubberBandOptionWindowStandard = 0x00000000,
  RubberBandOptionWindowShort = 0x00100000,
  RubberBandOptionWindowLong = 0x00200000,

  RubberBandOptionSmoothingOff = 0x00000000,
  RubberBandOptionSmoothingOn = 0x00800000,

  RubberBandOptionFormantShifted = 0x00000000,
  RubberBandOptionFormantPreserved = 0x01000000,

  RubberBandOptionPitchHighSpeed = 0x00000000,
  RubberBandOptionPitchHighQuality = 0x02000000,
  RubberBandOptionPitchHighConsistency = 0x04000000,

  RubberBandOptionChannelsApart = 0x00000000,
  RubberBandOptionChannelsTogether = 0x10000000,

  RubberBandOptionEngineFaster = 0x00000000,
  RubberBandOptionEngineFiner = 0x20000000
}

export enum RubberBandPresetOption {
  DefaultOptions = 0x00000000,
  PercussiveOptions = 0x00102000,
}

export type RubberBandState = number;

export class RubberBandInterface {
  private wasm: { heap: { HEAP8: Uint8Array; HEAP32: Uint32Array }; exports: any };

  private constructor() { }

  static async initialize(module: WebAssembly.Module) {
    if (typeof WebAssembly === "undefined") {
      throw new Error("WebAssembly is not supported in this environment!");
    }

    let heap = {} as { HEAP8: Uint8Array; HEAP32: Uint32Array };

    const errorHandler = (...params) => {
      console.error("WASI called with params", params);
      return 52;
    };

    let printBuffer = [] as string[];

    const wasmInstance = await WebAssembly.instantiate(module, {
      env: {
        emscripten_notify_memory_growth: () => {
          heap.HEAP8 = new Uint8Array((wasmInstance.exports as any).memory.buffer);
          heap.HEAP32 = new Uint32Array((wasmInstance.exports as any).memory.buffer);
        },
      },
      wasi_snapshot_preview1: {
        proc_exit: (...params) => errorHandler("proc_exit", params),
        fd_read: (...params) => errorHandler("fd_read", params),
        fd_write: (fd, iov, iovcnt, pnum) => {
          if (fd > 2) return 52;
          let num = 0;
          for (let i = 0; i < iovcnt; i++) {
            const ptr = heap.HEAP32[iov >> 2];
            const len = heap.HEAP32[(iov + 4) >> 2];
            iov += 8;
            for (let j = 0; j < len; j++) {
              const curr = heap.HEAP8[ptr + j];
              if (curr === 0 || curr === 10) {
                console.log(printBuffer.join(""));
                printBuffer.length = 0;
              } else {
                printBuffer.push(String.fromCharCode(curr));
              }
            }
            num += len;
          }
          heap.HEAP32[pnum >> 2] = num;
          return 0;
        },
        fd_seek: (...params) => errorHandler("fd_seek", params),
        fd_close: (...params) => errorHandler("fd_close", params),
        environ_sizes_get: (penviron_count, penviron_buf_size) => {
          // heap.HEAP32[penviron_count >> 2] = 0;
          // heap.HEAP32[penviron_buf_size >> 2] = 0;
          return 52; // NO_SYS
        },
        environ_get: (...params) => errorHandler("environ_get", params),
        clock_time_get: (...params) => errorHandler("clock_time_get", params),
      },
    });

    const exports = wasmInstance.exports as any;

    heap.HEAP8 = new Uint8Array((wasmInstance.exports as any).memory.buffer);
    heap.HEAP32 = new Uint32Array((wasmInstance.exports as any).memory.buffer);

    exports._initialize();

    const instance = { heap, exports };
    const ret = new RubberBandInterface();
    ret.wasm = instance;
    return ret;
  }

  malloc(size: number): number {
    return this.wasm.exports.wasm_malloc(size);
  }

  memWrite(destPtr: number, data: Uint8Array | Float32Array) {
    const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    this.wasm.heap.HEAP8.set(uint8Array, destPtr);
  }

  memWritePtr(destPtr: number, srcPtr: number) {
    const buf = new Uint8Array(4);
    const view = new DataView(buf.buffer);
    view.setUint32(0, srcPtr, true);
    this.wasm.heap.HEAP8.set(buf, destPtr);
  }

  memReadU8(srcPtr: number, length: number) {
    return this.wasm.heap.HEAP8.subarray(srcPtr, srcPtr + length);
  }

  memReadF32(srcPtr: number, length: number) {
    const res = this.memReadU8(srcPtr, length * 4);
    return new Float32Array(res.buffer, res.byteOffset, length);
  }

  free(ptr: number) {
    this.wasm.exports.wasm_free(ptr);
  }

  rubberband_new(
    sampleRate: number,
    channels: number,
    options: RubberBandOption,
    initialTimeRatio: number,
    initialPitchScale: number
  ): RubberBandState {
    return this.wasm.exports.rb_new(sampleRate, channels, options, initialTimeRatio, initialPitchScale);
  }

  rubberband_delete(state: RubberBandState) {
    this.wasm.exports.rb_delete(state);
  }

  rubberband_reset(state: RubberBandState) {
    this.wasm.exports.rb_reset(state);
  }

  rubberband_set_time_ratio(state: RubberBandState, ratio: number) {
    this.wasm.exports.rb_set_time_ratio(state, ratio);
  }

  rubberband_set_pitch_scale(state: RubberBandState, scale: number) {
    this.wasm.exports.rb_set_pitch_scale(state, scale);
  }

  rubberband_get_time_ratio(state: RubberBandState): number {
    return this.wasm.exports.rb_get_time_ratio(state);
  }

  rubberband_get_pitch_scale(state: RubberBandState): number {
    return this.wasm.exports.rb_get_pitch_scale(state);
  }

  rubberband_get_latency(state: RubberBandState): number {
    return this.wasm.exports.rb_get_latency(state);
  }

  rubberband_set_transients_option(state: RubberBandState, options: RubberBandOption) {
    this.wasm.exports.rb_set_transients_option(state, options);
  }

  rubberband_set_detector_option(state: RubberBandState, options: RubberBandOption) {
    this.wasm.exports.rb_set_detector_option(state, options);
  }

  rubberband_set_phase_option(state: RubberBandState, options: RubberBandOption) {
    this.wasm.exports.rb_set_phase_option(state, options);
  }

  rubberband_set_formant_option(state: RubberBandState, options: RubberBandOption) {
    this.wasm.exports.rb_set_formant_option(state, options);
  }

  rubberband_set_pitch_option(state: RubberBandState, options: RubberBandOption) {
    this.wasm.exports.rb_set_pitch_option(state, options);
  }

  rubberband_set_expected_input_duration(state: RubberBandState, samples: number) {
    this.wasm.exports.rb_set_expected_input_duration(state, samples);
  }

  rubberband_get_samples_required(state: RubberBandState): number {
    return this.wasm.exports.rb_get_samples_required(state);
  }

  rubberband_set_max_process_size(state: RubberBandState, samples: number) {
    this.wasm.exports.rb_set_max_process_size(state, samples);
  }

  rubberband_set_key_frame_map(state: RubberBandState, keyframecount: number, from: number, to: number) {
    this.wasm.exports.rb_set_key_frame_map(state, keyframecount, from, to);
  }

  rubberband_study(state: RubberBandState, input: number, samples: number, final: number) {
    this.wasm.exports.rb_study(state, input, samples, final);
  }

  rubberband_process(state: RubberBandState, input: number, samples: number, final: number) {
    this.wasm.exports.rb_process(state, input, samples, final);
  }

  rubberband_available(state: RubberBandState): number {
    return this.wasm.exports.rb_available(state);
  }

  rubberband_retrieve(state: RubberBandState, output: number, samples: number): number {
    return this.wasm.exports.rb_retrieve(state, output, samples);
  }

  rubberband_get_channel_count(state: RubberBandState): number {
    return this.wasm.exports.rb_get_channel_count(state);
  }

  rubberband_calculate_stretch(state: RubberBandState) {
    this.wasm.exports.rb_calculate_stretch(state);
  }

  rubberband_set_debug_level(state: RubberBandState, level: number) {
    this.wasm.exports.rb_set_debug_level(state, level);
  }

  rubberband_set_default_debug_level(level: number) {
    this.wasm.exports.rb_set_default_debug_level(level);
  }
}
