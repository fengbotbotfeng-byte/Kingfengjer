import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Home from "./Home.jsx";
import usePageTitle from "../hooks/usePageTitle.js";

const SONG_URL = "https://u.pone.rs/qvbbldqa.mp3";

function Cake() {
  return (
    <div className="birthday-cake" aria-label="Kue ulang tahun tiga tingkat dengan lima lilin">
      <div className="cake-candles">
        {Array.from({ length: 5 }, (_, i) => (
          <span className="cake-candle" key={i}><i /></span>
        ))}
      </div>
      <div className="cake-tier cake-tier--top">
        <span className="cake-icing" />
        <span className="cake-strawberry s1" />
        <span className="cake-strawberry s2" />
        <span className="cake-strawberry s3" />
      </div>
      <div className="cake-tier cake-tier--middle"><span className="cake-icing" /></div>
      <div className="cake-tier cake-tier--bottom"><span className="cake-icing" /></div>
      <div className="cake-plate" />
    </div>
  );
}

export default function Landing() {
  usePageTitle();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [playBlocked, setPlayBlocked] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const enterStarted = useRef(false);

  // Hanya dipanggil saat lagu benar-benar selesai. Tidak ada timer 5 detik.
  const enter = useCallback(() => {
    if (enterStarted.current) return;
    enterStarted.current = true;
    setLeaving(true);

    const audio = audioRef.current;
    if (audio) {
      const fadeStart = performance.now();
      const initialVolume = audio.volume;
      const fade = (now) => {
        const progress = Math.min(1, (now - fadeStart) / 850);
        audio.volume = Math.max(0, initialVolume * (1 - progress));
        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          audio.pause();
          audio.currentTime = 0;
        }
      };
      requestAnimationFrame(fade);
    }

    window.setTimeout(() => navigate("/home", { replace: true }), 900);
  }, [navigate]);

  const startSong = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || started || enterStarted.current) return;

    try {
      await audio.play();
      setStarted(true);
      setPlayBlocked(false);
    } catch {
      // Browser HP dapat memblokir autoplay bersuara sampai ada sentuhan pengguna.
      setPlayBlocked(true);
    }
  }, [started]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.72;
    startSong();

    // Tidak ada auto-enter 5 detik. Overlay menunggu event audio ended.
  }, [startSong]);

  return (
    <div className={`birthday-intro${leaving ? " is-leaving" : ""}${started ? " is-playing" : ""}`}>
      <div className="birthday-home-underlay"><Home /></div>

      <div className="birthday-atmosphere" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span className={`birthday-balloon balloon-${i + 1}`} key={i} />
        ))}
        <span className="birthday-butterfly butterfly-pink">🦋</span>
        <span className="birthday-butterfly butterfly-blue">🦋</span>
        <span className="birthday-hearts">♡　♡　♡</span>
      </div>

      <div className="birthday-cake-stage"><Cake /></div>

      <audio
        ref={audioRef}
        src={SONG_URL}
        preload="auto"
        autoPlay
        playsInline
        onPlay={() => {
          setStarted(true);
          setPlayBlocked(false);
        }}
        onEnded={enter}
        onError={() => setPlayBlocked(true)}
      />

      {playBlocked && !started && (
        <button
          type="button"
          className="birthday-speaker"
          aria-label="Putar lagu"
          title="Putar lagu"
          onClick={startSong}
        >
          ♫
        </button>
      )}
    </div>
  );
}
