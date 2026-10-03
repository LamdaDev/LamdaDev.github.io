"""Create the portfolio's original, seamless cafe instrumental. No recorded samples.

Requires NumPy and FFmpeg in the generator environment, not in the website.
Run: python scripts/generate-cafe-audio.py [optional_encoder_module_directory]
"""
from pathlib import Path
import json
import math
import sys
import shutil
import subprocess
import tempfile
import wave

if len(sys.argv) > 1:
    sys.path.insert(0, sys.argv[1])
import numpy as np
try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    FFMPEG = shutil.which('ffmpeg')
if not FFMPEG:
    raise SystemExit('FFmpeg is needed only to regenerate the audio asset.')

RATE = 44100
BPM = 74
BEAT = 60 / BPM
BARS = 16
SAMPLES = round(BARS * 4 * BEAT * RATE)
# Use the rounded loop duration as the timing grid to avoid a fractional-sample seam.
BEAT = SAMPLES / RATE / (BARS * 4)
rng = np.random.default_rng(20261001)
mix = np.zeros((SAMPLES, 2), dtype=np.float64)


def add(signal, beat, gain=1.0, pan=0.0):
    start = round(beat * BEAT * RATE)
    indexes = (start + np.arange(len(signal))) % SAMPLES
    # Constant-power stereo placement; every note tail wraps naturally into the loop.
    angle = (pan + 1) * math.pi / 4
    np.add.at(mix[:, 0], indexes, signal * gain * math.cos(angle))
    np.add.at(mix[:, 1], indexes, signal * gain * math.sin(angle))


def note(midi, duration=3.0, instrument='piano'):
    time = np.arange(round(duration * RATE)) / RATE
    hz = 440 * 2 ** ((midi - 69) / 12)
    attack = 1 - np.exp(-time / .014)
    release = np.minimum(1, np.maximum(0, (duration - time) / .18))
    if instrument == 'bass':
        wave = np.sin(2 * np.pi * hz * time) + .18 * np.sin(4 * np.pi * hz * time)
        return wave * attack * np.exp(-time / .52) * release
    if instrument == 'pad':
        wave = np.sin(2 * np.pi * hz * time) + .16 * np.sin(2 * np.pi * hz * 1.002 * time)
        return wave * (1 - np.exp(-time / .35)) * np.minimum(1, (duration - time) / .8)
    # A rounded electric-piano voice with upper partials that soften after each attack.
    wave = np.sin(2 * np.pi * hz * time)
    wave += .24 * np.exp(-time / .55) * np.sin(4 * np.pi * hz * time + .18)
    wave += .08 * np.exp(-time / .2) * np.sin(6 * np.pi * hz * time)
    wave += .1 * np.sin(2 * np.pi * hz * 1.0018 * time)
    return wave * attack * np.exp(-time / 1.02) * release


chords = [([55, 59, 62, 64, 67], 36), ([55, 59, 60, 64, 69], 33),
          ([53, 57, 60, 64, 65], 38), ([53, 57, 59, 64, 67], 31)]
melodies = [[76, 74, 71, 67], [72, 71, 69, 64], [69, 72, 76, 74], [71, 69, 67, 74]]
for bar in range(BARS):
    chord_index = (bar // 2) % 4
    voicing, root = chords[chord_index]
    base = bar * 4
    for position, velocity in [(0, 1), (1.65, .53), (2.5, .72)]:
        for i, pitch in enumerate(voicing):
            add(note(pitch), base + position + i * .016, .047 * velocity, (i - 2) * .12)
    if bar % 2 == 0:
        for i, pitch in enumerate(voicing):
            add(note(pitch, BEAT * 8, 'pad'), base, .009, (i - 2) * .2)
    for position, pitch, velocity in [(0, root, 1), (1.5, root + 7, .68), (2.75, root + 12, .63)]:
        add(note(pitch, 1.65, 'bass'), base + position, .10 * velocity)
    # Sparse motif with room for the chords; the second pass answers the first.
    motif = melodies[chord_index]
    for i, position in enumerate([.6, 1.35, 2.65]):
        pitch = motif[(i + (bar % 2) + (1 if bar >= 8 else 0)) % 4]
        add(note(pitch, 2.0), base + position, .022 if i != 1 else .016, -.22)
    for beat in range(4):
        # A very quiet low kick and gentle brushed snare, with no harsh transient.
        t = np.arange(round(.15 * RATE)) / RATE
        kick = np.sin(2 * np.pi * (49 * t + 18 * .025 * (1 - np.exp(-t / .025))))
        kick *= (1 - np.exp(-t / .005)) * np.exp(-t / .045)
        if beat in [0, 2]:
            add(kick, base + beat, .027)
        if beat in [1, 3]:
            noise = rng.standard_normal(round(.26 * RATE))
            brushed = np.convolve(noise, np.ones(18) / 18, mode='same')
            tt = np.arange(len(brushed)) / RATE
            brushed *= (1 - np.exp(-tt / .018)) * np.exp(-tt / .062)
            add(brushed, base + beat + .022, .065, .15)
        # Relaxed swung eighth-note texture, softer than the instrumental notes.
        for offset in [.0, .56]:
            noise = rng.standard_normal(round(.075 * RATE))
            smooth = np.convolve(noise, np.ones(5) / 5, mode='same')
            tt = np.arange(len(smooth)) / RATE
            smooth *= (1 - np.exp(-tt / .004)) * np.exp(-tt / .016)
            add(smooth, base + beat + offset, .018, .36)

# Circular stereo room echoes preserve the exact loop rather than adding trailing silence.
dry = mix.copy()
for delay, gain in [(.075, .13), (.119, .08), (.218, .04)]:
    mix += np.roll(dry[:, ::-1], round(RATE * delay), axis=0) * gain
mix -= np.mean(mix, axis=0)
mix = np.tanh(mix * 1.35)
mix *= .72 / np.max(np.abs(mix))
pcm = np.round(mix * 32767).astype('<i2')
output = Path(__file__).resolve().parents[1] / 'public' / 'assets' / 'audio' / 'cafe-loop.mp3'
output.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='daniel-cafe-') as temp:
    wav_path = Path(temp) / 'composition.wav'
    with wave.open(str(wav_path), 'wb') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(pcm.tobytes())
    # A seekable output lets FFmpeg include Xing/LAME encoder-delay and padding tags.
    subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav_path),
                    '-codec:a', 'libmp3lame', '-b:a', '160k', '-write_xing', '1',
                    '-metadata', 'title=Boba Break', str(output)], check=True)
encoded = output.read_bytes()
print(json.dumps({'output': str(output), 'duration_seconds': SAMPLES / RATE,
                  'bytes': len(encoded), 'peak': float(np.max(np.abs(mix))),
                  'rms': float(np.sqrt(np.mean(mix ** 2))),
                  'loop_edge_step': float(np.max(np.abs(mix[0] - mix[-1]))),
                  'clipped_samples': int(np.sum(np.abs(pcm.astype(np.int32)) >= 32767)),
                  'bpm': BPM, 'sample_rate': RATE}, indent=2))