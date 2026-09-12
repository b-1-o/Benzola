import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

const ASSET_BASE = "https://raw.githubusercontent.com/b-1-o/Benzola/main";
const MAIN_BG = `${ASSET_BASE}/dark-canopy.jpg`;
const SECONDARY_BG = `${ASSET_BASE}/mist-forest.jpg`;
const HERO = `${ASSET_BASE}/fangs.webp`;
const HOODED = `${ASSET_BASE}/hooded.gif`;
const TRACK_SRC = `${ASSET_BASE}/Every-Time.mp3`;

const TRACK_NAME = "Every Time";
const ARTIST = "Benzola";

const LINKS = [
  {
    label: "TikTok",
    username: "@kelli2458",
    href: "https://www.tiktok.com/@kelli2458?_r=1&_t=ZG-99a2X7MxjEW",
    glyph: "♪",
    image: HERO,
  },
  {
    label: "Telegram",
    username: "@Benzola_qq",
    href: "https://t.me/Benzola_qq",
    glyph: "◈",
    image: HOODED,
  },
  {
    label: "Spotify",
    username: "Every Time",
    href: "https://open.spotify.com/track/5QiOePTbj8ltnRdYShfz3E",
    glyph: "◎",
    image: `${ASSET_BASE}/black-forest.png`,
  },
];

const LYRICS: { time: number; text: string }[] = [
  { time: 0, text: "…" },
  { time: 3.9, text: "Мне крутит голову прокуренный быт" },
  { time: 6.65, text: "Ком лезет из горла" },
  { time: 8.2, text: "Я твой невроз, социальная травма" },
  { time: 10.85, text: "Удары, порезы без повода" },
  { time: 12.55, text: "Мутная грязь" },
  { time: 14, text: "Среда обитания, нам с тобою комфортная" },
  { time: 17.1, text: "Память насилует мозг" },
  { time: 18.75, text: "Я снова даю дешёвое слово" },
  { time: 21.35, text: "Мёртвое тело, сгнившее нутро" },
  { time: 25.15, text: "Меня тащит на панельный или тащит на притон" },
  { time: 29.55, text: "Я шагаю, шагаю, шагаю хуй пойми на чём" },
  { time: 33.95, text: "Может быть, о лучшей жизни завтра мне приснится сон" },
  { time: 38.7, text: "О, мой Бог курит боль и колется ночами" },
  { time: 43.5, text: "Кремируй вечный покой, ведь счастье за горами" },
  { time: 47.55, text: "Моя муза блюёт кровавыми кишками" },
  { time: 52.45, text: "Я убит и разлагаюсь под твои печали" },
  { time: 56.05, text: "О, мой Бог курит боль и колется ночами" },
  { time: 61, text: "Кремируй вечный покой, ведь счастье за горами" },
  { time: 64.95, text: "Моя муза блюёт кровавыми кишками" },
  { time: 69.75, text: "Я убит и разлагаюсь под твои печали" },
  { time: 74, text: "…" },
];

function formatTime(s: number) {
  const m = Math.floor(Math.max(0, s) / 60);
  const sec = Math.floor(Math.max(0, s) % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 5.5h3v13h-3zm6 0h3v13h-3z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="m8.5 5.8 10 6.2-10 6.2z" />
    </svg>
  );
}

function Chevron({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d={direction === "right" ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"} />
    </svg>
  );
}

function Visualizer({ analyser, playing }: { analyser: AnalyserNode | null; playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    let raf = 0;
    let width = 1;
    let height = 1;
    const data = new Uint8Array(analyser?.frequencyBinCount || 128);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      width = Math.max(1, r.width);
      height = Math.max(1, r.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    if (!playing) {
      ctx.clearRect(0, 0, width, height);
      return () => window.removeEventListener("resize", resize);
    }

    const count = 28;
    const draw = () => {
      analyser?.getByteFrequencyData(data);
      ctx.clearRect(0, 0, width, height);
      const bw = width / count;
      const center = height / 2;

      for (let i = 0; i < count; i++) {
        const t = i / count;
        const idx = Math.min(data.length - 1, Math.floor(t ** 1.4 * data.length * 0.82));
        const live = (data[idx] || 0) / 255;
        const env = 0.28 + Math.sin(Math.PI * t) * 0.72;
        const h = Math.max(2, Math.pow(live, 1.1) * height * 0.92 * env);

        const gradient = ctx.createLinearGradient(0, center - h / 2, 0, center + h / 2);
        gradient.addColorStop(0, "rgba(255,255,255,0.05)");
        gradient.addColorStop(0.45, "rgba(240,236,230,0.75)");
        gradient.addColorStop(0.55, "rgba(220,40,40,0.55)");
        gradient.addColorStop(1, "rgba(255,255,255,0.03)");

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.5 + env * 0.4;
        ctx.fillRect(i * bw + 1.2, center - h / 2, Math.max(1.5, bw - 2.4), h);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [analyser, playing]);

  return <canvas ref={canvasRef} className="visualizer" />;
}

function Background({ playing }: { playing: boolean }) {
  return (
    <div className="background" aria-hidden="true">
      <AnimatePresence initial={false} mode="sync">
        <motion.img
          key={playing ? "play" : "idle"}
          className="background-image"
          src={playing ? SECONDARY_BG : MAIN_BG}
          alt=""
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>
      <div className="background-colorwash" />
      <div className="background-fog" />
      <div className="background-vignette" />
      <div className="background-noise" />
    </div>
  );
}

function PortalLink({
  link,
  armed,
  onArm,
  onReset,
}: {
  link: (typeof LINKS)[number];
  armed: boolean;
  onArm: () => void;
  onReset: () => void;
}) {
  return (
    <div className={`portal-shell ${armed ? "armed" : ""}`}>
      <div className="portal-card glass" onPointerDown={(e) => e.stopPropagation()}>
        <div className="portal-face">
          <span className="portal-glyph">{link.glyph}</span>
          <span className="portal-label">{link.label}</span>
          <span className="portal-orbit">↗</span>
        </div>
        <div className="portal-open">
          <div className="social-art">
            <img src={link.image} alt="" loading="eager" decoding="async" />
            <span className="social-art-shine" />
          </div>
          <div className="portal-copy">
            <strong>{link.label}</strong>
            <span>{link.username}</span>
            <small>ENTER THE PORTAL</small>
          </div>
          <a
            className="portal-go"
            href={link.href}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Open ${link.label}`}
          >
            <Chevron />
          </a>
          <button className="portal-close" onClick={onReset} aria-label={`Close ${link.label}`}>
            ×
          </button>
        </div>
        {!armed && (
          <button className="portal-hit" onClick={onArm} aria-label={`Open ${link.label}`} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [armedLink, setArmedLink] = useState<number | null>(null);
  const [lyricsOpen, setLyricsOpen] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const activeLyricIndex = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < LYRICS.length; i++) {
      if (LYRICS[i].time <= currentTime) idx = i;
      else break;
    }
    return idx;
  }, [currentTime]);

  const activeLyric = LYRICS[activeLyricIndex];
  const nextLyric = LYRICS[activeLyricIndex + 1];

  const ensureAudioGraph = useCallback(async () => {
    if (!audioRef.current) return;
    if (!audioContextRef.current) {
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaElementSource(audioRef.current);
      const anal = ctx.createAnalyser();
      anal.fftSize = 256;
      anal.smoothingTimeConstant = 0.78;
      source.connect(anal);
      anal.connect(ctx.destination);
      sourceRef.current = source;
      analyserRef.current = anal;
      setAnalyser(anal);
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await ensureAudioGraph();
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      // autoplay policies etc.
    }
  }, [ensureAudioGraph]);

  useEffect(() => {
    const audio = new Audio(TRACK_SRC);
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onMeta = () => setDuration(audio.duration || 0);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audioRef.current = null;
    };
  }, []);

  const seek = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
    setCurrentTime(audio.currentTime);
  }, []);

  return (
    <div className="app" onPointerDown={() => armedLink !== null && setArmedLink(null)}>
      <Background playing={playing} />

      <main className={`page ${armedLink !== null ? "portal-open-page" : ""}`}>
        <motion.header
          className="identity"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="identity-cross">†</span>
          <span className="identity-mark">BENZOLA</span>
          <span className="identity-name">fallen · beloved · eternal</span>
        </motion.header>

        <motion.p
          className="quote"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          вечность пахнет дымом и снегом
        </motion.p>

        <section className={`player glass ${playing ? "playing" : ""} ${armedLink !== null ? "collapsed" : ""}`}>
          <div className="player-header">
            <span className="live-indicator">
              <i />
              {playing ? "live" : "idle"}
            </span>
            <span className="track-badge">01</span>
          </div>

          <div className="visual-stage">
            <div className="visual-aura" />
            <div className="visual-ring ring-one" />
            <div className="visual-ring ring-two" />
            <div className="glass-core">
              <div className="core-reflection" />
              <motion.div
                className="core-pulse"
                animate={
                  playing
                    ? { scale: [1, 1.14, 1], opacity: [0.25, 0.6, 0.25] }
                    : { scale: 1, opacity: 0.18 }
                }
                transition={
                  playing
                    ? { duration: 1.9, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
              />
              <div className="core-line" />
            </div>
            <Visualizer analyser={analyser} playing={playing} />
          </div>

          <div className="track-meta">
            <strong>{TRACK_NAME}</strong>
            <span>{ARTIST}</span>
          </div>

          <div className="player-controls">
            <motion.button
              type="button"
              className="play-button"
              onClick={togglePlay}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.04 }}
              aria-label={playing ? "Pause" : "Play"}
            >
              <PlayIcon playing={playing} />
            </motion.button>
          </div>

          <div className="progress-track" onPointerDown={seek} role="slider" aria-label="Track progress">
            <div className="progress-fill" style={{ transform: `scaleX(${progress})` }} />
            <div className="progress-thumb" style={{ left: `${progress * 100}%` }} />
          </div>

          <div className="time-row">
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button type="button" className="lyrics-toggle" onClick={() => setLyricsOpen((v) => !v)}>
              {lyricsOpen ? "COLLAPSE" : "LYRICS"}
            </button>
          </div>

          <div className={`lyrics-panel ${lyricsOpen ? "open" : ""}`}>
            {activeLyric && (
              <div className="lyric-spotlight">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLyric.time}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                    className="lyric-current"
                  >
                    {activeLyric.text}
                  </motion.div>
                </AnimatePresence>
                {nextLyric && <div className="lyric-next">{nextLyric.text}</div>}
              </div>
            )}
          </div>
        </section>

        <nav className="links">
          {LINKS.map((link, index) => (
            <motion.div
              key={link.label}
              className={`link-row ${armedLink === index ? "active-row" : ""}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.07, duration: 0.5 }}
            >
              <PortalLink
                link={link}
                armed={armedLink === index}
                onArm={() => setArmedLink(index)}
                onReset={() => setArmedLink(null)}
              />
            </motion.div>
          ))}
        </nav>

        <motion.footer
          className="footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          † eternal
        </motion.footer>
      </main>
    </div>
  );
}
