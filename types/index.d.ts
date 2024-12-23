export declare enum RubberBandOption {
    RubberBandOptionProcessOffline = 0,
    RubberBandOptionProcessRealTime = 1,
    RubberBandOptionStretchElastic = 0,
    RubberBandOptionStretchPrecise = 16,
    RubberBandOptionTransientsCrisp = 0,
    RubberBandOptionTransientsMixed = 256,
    RubberBandOptionTransientsSmooth = 512,
    RubberBandOptionDetectorCompound = 0,
    RubberBandOptionDetectorPercussive = 1024,
    RubberBandOptionDetectorSoft = 2048,
    RubberBandOptionPhaseLaminar = 0,
    RubberBandOptionPhaseIndependent = 8192,
    RubberBandOptionThreadingAuto = 0,
    RubberBandOptionThreadingNever = 65536,
    RubberBandOptionThreadingAlways = 131072,
    RubberBandOptionWindowStandard = 0,
    RubberBandOptionWindowShort = 1048576,
    RubberBandOptionWindowLong = 2097152,
    RubberBandOptionSmoothingOff = 0,
    RubberBandOptionSmoothingOn = 8388608,
    RubberBandOptionFormantShifted = 0,
    RubberBandOptionFormantPreserved = 16777216,
    RubberBandOptionPitchHighSpeed = 0,
    RubberBandOptionPitchHighQuality = 33554432,
    RubberBandOptionPitchHighConsistency = 67108864,
    RubberBandOptionChannelsApart = 0,
    RubberBandOptionChannelsTogether = 268435456,
    RubberBandOptionEngineFaster = 0,
    RubberBandOptionEngineFiner = 536870912
}
export declare enum RubberBandPresetOption {
    DefaultOptions = 0,
    PercussiveOptions = 1056768
}
export declare type RubberBandState = number;
export declare class RubberBandInterface {
    private wasm;
    private constructor();
    static initialize(module: WebAssembly.Module): Promise<RubberBandInterface>;
    malloc(size: number): number;
    memWrite(destPtr: number, data: Uint8Array | Float32Array): void;
    memWritePtr(destPtr: number, srcPtr: number): void;
    memReadU8(srcPtr: number, length: number): Uint8Array;
    memReadF32(srcPtr: number, length: number): Float32Array;
    free(ptr: number): void;
    rubberband_new(sampleRate: number, channels: number, options: RubberBandOption, initialTimeRatio: number, initialPitchScale: number): RubberBandState;
    rubberband_delete(state: RubberBandState): void;
    rubberband_reset(state: RubberBandState): void;
    rubberband_set_time_ratio(state: RubberBandState, ratio: number): void;
    rubberband_set_pitch_scale(state: RubberBandState, scale: number): void;
    rubberband_set_formant_scale(state: RubberBandState, scale: number): void;
    rubberband_get_time_ratio(state: RubberBandState): number;
    rubberband_get_pitch_scale(state: RubberBandState): number;
    rubberband_get_formant_scale(state: RubberBandState): number;
    rubberband_get_preferred_start_pad(state: RubberBandState): number;
    rubberband_get_start_delay(state: RubberBandState): number;
    rubberband_get_latency(state: RubberBandState): number;
    rubberband_set_transients_option(state: RubberBandState, options: RubberBandOption): void;
    rubberband_set_detector_option(state: RubberBandState, options: RubberBandOption): void;
    rubberband_set_phase_option(state: RubberBandState, options: RubberBandOption): void;
    rubberband_set_formant_option(state: RubberBandState, options: RubberBandOption): void;
    rubberband_set_pitch_option(state: RubberBandState, options: RubberBandOption): void;
    rubberband_set_expected_input_duration(state: RubberBandState, samples: number): void;
    rubberband_get_samples_required(state: RubberBandState): number;
    rubberband_set_max_process_size(state: RubberBandState, samples: number): void;
    rubberband_get_process_size_limit(state: RubberBandState): number;
    rubberband_set_key_frame_map(state: RubberBandState, keyframecount: number, from: number, to: number): void;
    rubberband_study(state: RubberBandState, input: number, samples: number, final: number): void;
    rubberband_process(state: RubberBandState, input: number, samples: number, final: number): void;
    rubberband_available(state: RubberBandState): number;
    rubberband_retrieve(state: RubberBandState, output: number, samples: number): number;
    rubberband_get_channel_count(state: RubberBandState): number;
    rubberband_calculate_stretch(state: RubberBandState): void;
    rubberband_set_debug_level(state: RubberBandState, level: number): void;
    rubberband_set_default_debug_level(level: number): void;
}
