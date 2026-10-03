# Boba Break / Pause boba

A quiet, original instrumental made for this portfolio: warm electric-piano voicings, a sparse melody, soft bass, and gentle brushes. There are no third-party recordings, samples, or vocals.

- Asset: `public/assets/audio/cafe-loop.mp3`
- Arrangement: 16 bars at 74 BPM, C major 9 / A minor 9 / D minor 9 / G 13.
- Source duration: approximately 51.9 seconds; stereo, 44.1 kHz, 160 kbps MP3.
- The composition uses periodic note tails and room echoes so the end returns naturally to the beginning. The MP3 includes gapless metadata; actual loop timing depends on the browser's native media playback.
- The source signal peaks at 0.72 full scale with no clipped samples. Playback starts at 25% volume and is always opt-in.

The player never autoplays, never restores a previous playing state, and pauses when the page becomes hidden. It saves only a volume preference where browser storage is available. Changing language does not restart playback. The custom controls expose Play/Pause, Mute, Volume, and Track position to keyboard and assistive-technology users; errors offer an explicit retry.

To regenerate the file, run `scripts/generate-cafe-audio.py` in a Python environment with NumPy and an FFmpeg executable (the generator can discover a temporary `imageio-ffmpeg` installation). These are optional asset-authoring tools, not website or browser dependencies.