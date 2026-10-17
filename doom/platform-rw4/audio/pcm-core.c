/* SPDX-License-Identifier: GPL-2.0-only
 * Platform-independent PCM core. Not linked into the physical game yet. */
#include "pcm-core.h"
static uint32_t le16(const uint8_t *p) { return (uint32_t)p[0] | (uint32_t)p[1] << 8; }
static uint32_t le32(const uint8_t *p) { return le16(p) | le16(p + 2) << 16; }
static int valid(const struct doomed_mixer *m) { return m && m->rate >= 8000 && m->rate <= 48000; }
int doomed_dmx_decode(const uint8_t *p, size_t bytes, struct doomed_sample *out)
{
    if (!p || !out || bytes < 8 || le16(p) != 3) return -1;
    uint32_t rate = le16(p + 2), length = le32(p + 4);
    if (rate < 4000 || rate > 48000 || length <= 48 || length > 262144 || length > bytes - 8) return -1;
    out->data = p + 24; out->length = length - 32; out->rate = rate; return 0;
}
void doomed_mixer_stop_all(struct doomed_mixer *m)
{
    if (!m) return;
    for (unsigned i = 0; i < DOOMED_AUDIO_CHANNELS; i++) {
        struct doomed_voice *v = &m->voices[i];
        v->sample.data = 0; v->sample.length = 0; v->sample.rate = 0;
        v->position = 0; v->fraction = 0; v->volume = 0;
    }
    m->paused = 0;
}
int doomed_mixer_init(struct doomed_mixer *m, uint32_t rate)
{
    if (!m || rate < 8000 || rate > 48000) return -1;
    m->rate = rate; doomed_mixer_stop_all(m); return 0;
}
int doomed_mixer_start(struct doomed_mixer *m, unsigned id, const struct doomed_sample *s, unsigned volume)
{
    if (!valid(m) || id >= DOOMED_AUDIO_CHANNELS || !s || !s->data ||
        !s->length || s->length > 262112 || s->rate < 4000 || s->rate > 48000 || volume > 127) return -1;
    struct doomed_voice *v = &m->voices[id];
    v->sample = *s; v->position = 0; v->fraction = 0; v->volume = volume; return 0;
}
int doomed_mixer_stop(struct doomed_mixer *m, unsigned id)
{
    if (!valid(m) || id >= DOOMED_AUDIO_CHANNELS) return -1;
    m->voices[id].sample.data = 0; return 0;
}
int doomed_mixer_pause(struct doomed_mixer *m, unsigned paused)
{
    if (!valid(m) || paused > 1) return -1;
    m->paused = paused; return 0;
}
int doomed_mixer_render(struct doomed_mixer *m, int16_t *out, unsigned count)
{
    if (!valid(m) || !out || !count || count > DOOMED_AUDIO_BLOCK_MAX) return -1;
    for (unsigned i = 0; i < count; i++) {
        int32_t mixed = 0;
        if (!m->paused) for (unsigned c = 0; c < DOOMED_AUDIO_CHANNELS; c++) {
            struct doomed_voice *v = &m->voices[c];
            if (!v->sample.data) continue;
            mixed += ((int32_t)v->sample.data[v->position] - 128) * 256 * (int32_t)v->volume / 127;
            v->fraction += v->sample.rate;
            v->position += v->fraction / m->rate; v->fraction %= m->rate;
            if (v->position >= v->sample.length) v->sample.data = 0;
        }
        out[i] = mixed > 32767 ? 32767 : mixed < -32768 ? -32768 : (int16_t)mixed;
    }
    return 0;
}
