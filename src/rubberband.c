#include <emscripten.h>
#include <stdlib.h>
#include <rubberband-c.h>

#ifdef _MSC_VER
#define EMSCRIPTEN_KEEPALIVE;
#endif

EMSCRIPTEN_KEEPALIVE void* wasm_malloc(unsigned long size) {
  return malloc(size);
}

EMSCRIPTEN_KEEPALIVE void wasm_free(void* ptr) {
  return free(ptr);
}

EMSCRIPTEN_KEEPALIVE RubberBandState rb_new(unsigned int sampleRate, unsigned int channels, RubberBandOptions options, double initialTimeRatio, double initialPitchScale) {
  return rubberband_new(sampleRate, channels, options, initialTimeRatio, initialPitchScale);
}

EMSCRIPTEN_KEEPALIVE void rb_delete(RubberBandState state) { rubberband_delete(state); }

EMSCRIPTEN_KEEPALIVE void rb_reset(RubberBandState state) { rubberband_reset(state); }

EMSCRIPTEN_KEEPALIVE void rb_set_time_ratio(RubberBandState state, double ratio) { rubberband_set_time_ratio(state, ratio); }
EMSCRIPTEN_KEEPALIVE void rb_set_pitch_scale(RubberBandState state, double scale) { rubberband_set_pitch_scale(state, scale); }

EMSCRIPTEN_KEEPALIVE double rb_get_time_ratio(const RubberBandState state) { return rubberband_get_time_ratio(state); }
EMSCRIPTEN_KEEPALIVE double rb_get_pitch_scale(const RubberBandState state) { return rubberband_get_pitch_scale(state); }

EMSCRIPTEN_KEEPALIVE unsigned int rb_get_latency(const RubberBandState state) { return rubberband_get_latency(state); }

EMSCRIPTEN_KEEPALIVE void rb_set_transients_option(RubberBandState state, RubberBandOptions options) { rubberband_set_transients_option(state, options); }
EMSCRIPTEN_KEEPALIVE void rb_set_detector_option(RubberBandState state, RubberBandOptions options) { rubberband_set_detector_option(state, options); }
EMSCRIPTEN_KEEPALIVE void rb_set_phase_option(RubberBandState state, RubberBandOptions options) { rubberband_set_phase_option(state, options); }
EMSCRIPTEN_KEEPALIVE void rb_set_formant_option(RubberBandState state, RubberBandOptions options) { rubberband_set_formant_option(state, options); }
EMSCRIPTEN_KEEPALIVE void rb_set_pitch_option(RubberBandState state, RubberBandOptions options) { rubberband_set_pitch_option(state, options); }

EMSCRIPTEN_KEEPALIVE void rb_set_expected_input_duration(RubberBandState state, unsigned int samples) { rubberband_set_expected_input_duration(state, samples); };

EMSCRIPTEN_KEEPALIVE unsigned int rb_get_samples_required(const RubberBandState state) { return rubberband_get_samples_required(state); }

EMSCRIPTEN_KEEPALIVE void rb_set_max_process_size(RubberBandState state, unsigned int samples) { rubberband_set_max_process_size(state, samples); }
EMSCRIPTEN_KEEPALIVE void rb_set_key_frame_map(RubberBandState state, unsigned int keyframecount, unsigned int *from, unsigned int *to) { rubberband_set_key_frame_map(state, keyframecount, from, to); }

EMSCRIPTEN_KEEPALIVE void rb_study(RubberBandState state, const float *const *input, unsigned int samples, int final) { rubberband_study(state, input, samples, final); }
EMSCRIPTEN_KEEPALIVE void rb_process(RubberBandState state, const float *const *input, unsigned int samples, int final) { rubberband_process(state, input, samples, final); }

EMSCRIPTEN_KEEPALIVE int rb_available(const RubberBandState state) { return rubberband_available(state); } 
EMSCRIPTEN_KEEPALIVE unsigned int rb_retrieve(const RubberBandState state, float *const *output, unsigned int samples) { return rubberband_retrieve(state, output, samples); }

EMSCRIPTEN_KEEPALIVE unsigned int rb_get_channel_count(const RubberBandState state) { return rubberband_get_channel_count(state); }

EMSCRIPTEN_KEEPALIVE void rb_calculate_stretch(RubberBandState state) { rubberband_calculate_stretch(state); }

EMSCRIPTEN_KEEPALIVE void rb_set_debug_level(RubberBandState state, int level) { rubberband_set_debug_level(state, level); }
EMSCRIPTEN_KEEPALIVE void rb_set_default_debug_level(int level) { rubberband_set_default_debug_level(level); }
