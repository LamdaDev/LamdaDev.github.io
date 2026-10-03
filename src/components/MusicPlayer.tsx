import { useEffect, useId, useRef, useState } from 'react';
import { useLanguage } from '../i18n';
import '../runtime/music.css';

const VOLUME_KEY = 'daniel-cafe-volume';
const TRACK_SOURCE = `${import.meta.env.BASE_URL}assets/audio/cafe-loop.mp3`;

function PlayerIcon({ kind }: { kind: 'play' | 'pause' | 'sound' | 'muted' | 'cup' | 'chevron' }) {
  const paths = {
    play: <path d="m9 5 10 7-10 7Z" fill="currentColor" stroke="none" />,
    pause: <><path d="M8 5v14M16 5v14" strokeWidth="3" /></>,
    sound: <><path d="m11 5-5 4H3v6h3l5 4Z" /><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></>,
    muted: <><path d="m11 5-5 4H3v6h3l5 4Z" /><path d="m16 9 6 6m0-6-6 6" /></>,
    cup: <><path d="M4 9h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Zm12 1h2a3 3 0 0 1 0 6h-2M7 3v2m5-2v2" /></>,
    chevron: <path d="m6 15 6-6 6 6" />,
  };
  return <svg className={`music-icon music-icon--${kind}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

function clock(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/** Optional music stays off until a visitor explicitly presses Play. */
export function MusicPlayer() {
  const { text } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const requestRef = useRef(0);
  const pendingRef = useRef(false);
  const controlsId = useId();
  const [initialized, setInitialized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pending, setPending] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [started, setStarted] = useState(false);
  const [away, setAway] = useState(false);
  const [error, setError] = useState(false);
  const [volume, setVolume] = useState(.25);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    setInitialized(true);
    let saved = .25;
    try {
      const raw = window.localStorage.getItem(VOLUME_KEY);
      const parsed = raw === null ? NaN : Number(raw);
      if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) saved = parsed;
    } catch { /* Music remains usable when storage is unavailable. */ }
    setVolume(saved);
    if (audioRef.current) audioRef.current.volume = saved;
    const stopWhileAway = () => {
      if (!document.hidden || !audioRef.current || (audioRef.current.paused && !pendingRef.current)) return;
      requestRef.current += 1;
      audioRef.current.pause();
      pendingRef.current = false;
      setPending(false);
      setBuffering(false);
      setPlaying(false);
      setAway(true);
    };
    document.addEventListener('visibilitychange', stopWhileAway);
    return () => {
      requestRef.current += 1;
      audio?.pause();
      document.removeEventListener('visibilitychange', stopWhileAway);
    };
  }, []);

  // Header controls are a disclosure: dismiss when navigation or focus moves away.
  useEffect(() => {
    if (!expanded) return;
    const dismissOutside = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !playerRef.current?.contains(event.target)) setExpanded(false);
    };
    document.addEventListener('pointerdown', dismissOutside, true);
    document.addEventListener('focusin', dismissOutside);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside, true);
      document.removeEventListener('focusin', dismissOutside);
    };
  }, [expanded]);
  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    const request = ++requestRef.current;
    if (!audio.paused || pendingRef.current) {
      audio.pause();
      pendingRef.current = false;
      setPending(false);
      setBuffering(false);
      setPlaying(false);
      return;
    }
    if (error) audio.load();
    setError(false);
    setAway(false);
    pendingRef.current = true;
    setPending(true);
    try {
      await audio.play();
      if (request === requestRef.current) {
        pendingRef.current = false;
        setPending(false);
        setPlaying(!audio.paused);
        setStarted(true);
      }
    } catch (cause) {
      if (request !== requestRef.current) return;
      pendingRef.current = false;
      setPending(false);
      setBuffering(false);
      setPlaying(false);
      if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(true);
    }
  }

  function changeVolume(next: number) {
    const audio = audioRef.current;
    const bounded = Math.max(0, Math.min(1, next));
    setVolume(bounded);
    if (audio) { audio.volume = bounded; audio.muted = false; }
    setMuted(false);
    try { window.localStorage.setItem(VOLUME_KEY, String(bounded)); } catch { /* Optional preference. */ }
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    if (volume === 0) { changeVolume(.25); return; }
    audio.muted = !muted;
    setMuted(!muted);
  }

  const silent = muted || volume === 0;
  const status = error ? text('Music unavailable', 'Musique indisponible')
    : pending || buffering ? text('Loading music…', 'Chargement…')
    : playing ? text('A little café atmosphere', 'Une petite ambiance café')
    : started ? text('Paused, take your time', 'En pause, prenez votre temps')
    : text('Sound off. Your choice.', 'Sans son. À votre choix.');
  const playLabel = pending ? text('Cancel music loading', 'Annuler le chargement')
    : playing ? text('Pause café music', 'Mettre la musique en pause')
    : error ? text('Retry café music', 'Réessayer la musique')
    : text('Play café music', 'Écouter la musique du café');

  return <div ref={playerRef} role="group" hidden={!initialized} className={`music-player${expanded ? ' music-player--expanded' : ''}`} aria-label={text('Optional café music', 'Musique de café facultative')}
    onKeyDown={(event) => { if (event.key === 'Escape' && expanded) { event.stopPropagation(); setExpanded(false); expandButtonRef.current?.focus(); } }}>
    <audio ref={audioRef} src={TRACK_SOURCE} loop preload="none" aria-hidden="true"
      onPlaying={(event) => { pendingRef.current = false; if (document.hidden || event.currentTarget.paused) { event.currentTarget.pause(); setAway(document.hidden); setPlaying(false); setPending(false); setBuffering(false); return; } setPlaying(true); setStarted(true); setPending(false); setBuffering(false); setError(false); }}
      onPause={() => { setPlaying(false); setBuffering(false); }}
      onWaiting={() => { if (!audioRef.current?.paused) setBuffering(true); }}
      onCanPlay={() => setBuffering(false)}
      onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
      onError={() => { pendingRef.current = false; setError(true); setPending(false); setBuffering(false); setPlaying(false); }} />
    <div className="music-player-bar">
      <button className="music-play-button" type="button" onClick={() => void togglePlayback()} aria-label={playLabel} title={playLabel} aria-pressed={playing}>
        <PlayerIcon kind={playing || pending ? 'pause' : 'play'} />
      </button>
      <button ref={expandButtonRef} className="music-expand-button" type="button" aria-expanded={expanded} aria-controls={controlsId}
        aria-label={expanded ? text('Close café music controls', 'Fermer les commandes musicales') : text('Open café music controls', 'Ouvrir les commandes musicales')}
        onClick={() => setExpanded(!expanded)}>
        <PlayerIcon kind="cup" />
        <span className="music-title"><strong>{text('Boba Break', 'Pause boba')}</strong><span>{text('Little café', 'Petit café')}</span></span>
        <PlayerIcon kind="chevron" />
      </button>
    </div>
    <div id={controlsId} className="music-controls" hidden={!expanded}>
      <p className="music-status" role="status">{status}</p>
      <label className="music-seek-label">
        <span className="sr-only">{text('Track position', 'Position dans la piste')}</span>
        <input className="music-range" type="range" min="0" max={duration || 1} step=".1" value={Math.min(elapsed, duration || 1)} disabled={!duration || error}
          aria-valuetext={text(`${clock(elapsed)} of ${clock(duration)}`, `${clock(elapsed)} sur ${clock(duration)}`)}
          onChange={(event) => { const next = Number(event.currentTarget.value); if (audioRef.current) audioRef.current.currentTime = next; setElapsed(next); }} />
      </label>
      <div className="music-track-time" aria-hidden="true"><span>{clock(elapsed)}</span><span>{clock(duration)}</span></div>
      <div className="music-volume-row">
        <button type="button" className="music-mute-button" onClick={toggleMute} aria-pressed={silent}
          aria-label={silent ? text('Unmute café music', 'Rétablir le son') : text('Mute café music', 'Couper le son')}>
          <PlayerIcon kind={silent ? 'muted' : 'sound'} />
        </button>
        <label className="music-volume-label"><span>{text('Volume', 'Volume')}</span>
          <input className="music-range" type="range" min="0" max="1" step=".01" value={volume}
            aria-valuetext={`${Math.round(volume * 100)} %`} onChange={(event) => changeVolume(Number(event.currentTarget.value))} />
        </label>
        <span className="music-volume-value" aria-hidden="true">{silent ? 0 : Math.round(volume * 100)}%</span>
      </div>
      <p className="music-note">{error ? text('The track could not load. Press Play to retry.', 'La piste ne peut pas être chargée. Appuyez sur Lecture pour réessayer.')
        : away ? text('Paused while you were away. Press Play whenever you like.', 'En pause pendant votre absence. Relancez la lecture quand vous voulez.')
        : text('An original instrumental. No vocals, just a cozy loop.', 'Une création instrumentale. Sans paroles, tout en douceur.')}</p>
    </div>
    <span className="sr-only" role="status">{error ? text('Café music could not load. Open the controls or press Play to retry.', 'La musique du café ne peut pas être chargée. Ouvrez les commandes ou réessayez la lecture.') : ''}</span>
  </div>;
}