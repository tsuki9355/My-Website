import { useEffect, useRef, useState } from "react";
import { tracks } from "../data/tracks";
import "./MusicPlayer.css";

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
}

interface YTPlayerStateEvent {
  data: number;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: Record<string, number>;
          events?: {
            onStateChange?: (event: YTPlayerStateEvent) => void;
          };
        },
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_STATE_ENDED = 0;
const YT_STATE_PLAYING = 1;

function extractVideoId(idOrUrl: string): string {
  const patterns = [/youtu\.be\/([^?&/]+)/, /[?&]v=([^?&/]+)/, /embed\/([^?&/]+)/];
  for (const pattern of patterns) {
    const match = idOrUrl.match(pattern);
    if (match) return match[1];
  }
  return idOrUrl;
}

interface MusicPlayerProps {
  isGameMode: boolean;
}

function MusicPlayer({ isGameMode }: MusicPlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const trackIndexRef = useRef(0);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const track = tracks[trackIndex];

  useEffect(() => {
    trackIndexRef.current = trackIndex;
  }, [trackIndex]);

  useEffect(() => {
    if (window.YT) {
      setIsApiReady(true);
      return;
    }
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      setIsApiReady(true);
    };
    if (!document.getElementById("youtube-iframe-api")) {
      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!isApiReady || playerRef.current || !window.YT) return;
    try {
      playerRef.current = new window.YT.Player("music-player-yt", {
        videoId: extractVideoId(tracks[0].youtubeId),
        width: "1",
        height: "1",
        playerVars: { controls: 0, disablekb: 1 },
        events: {
          onStateChange: (event) => {
            setIsPlaying(event.data === YT_STATE_PLAYING);
            if (event.data === YT_STATE_ENDED) {
              const nextIndex = (trackIndexRef.current + 1) % tracks.length;
              setTrackIndex(nextIndex);
              playerRef.current?.loadVideoById(extractVideoId(tracks[nextIndex].youtubeId));
            }
          },
        },
      });
    } catch (error) {
      console.error(
        "Couldn't create the YouTube player — check that youtubeId values in data/tracks.ts are real video IDs (the part after \"v=\" in a YouTube URL), not a placeholder or full URL:",
        error,
      );
    }
  }, [isApiReady]);

  useEffect(() => {
    if (isGameMode) {
      playerRef.current?.pauseVideo();
    }
  }, [isGameMode]);

  function togglePlay() {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }

  function goToTrack(index: number, keepPlaying: boolean) {
    setTrackIndex(index);
    if (!playerRef.current) return;
    if (keepPlaying) {
      playerRef.current.loadVideoById(extractVideoId(tracks[index].youtubeId));
    } else {
      playerRef.current.cueVideoById(extractVideoId(tracks[index].youtubeId));
    }
  }

  function changeTrack(direction: 1 | -1) {
    const nextIndex = (trackIndex + direction + tracks.length) % tracks.length;
    goToTrack(nextIndex, isPlaying);
  }

  function selectTrack(index: number) {
    if (index === trackIndex) {
      togglePlay();
    } else {
      goToTrack(index, true);
    }
  }

  return (
    <div className={`music-player ${isGameMode ? "music-player-hidden" : ""}`}>
      <div id="music-player-yt" className="mp-yt-target" />
      <div className="music-player-playlist">
        {tracks.map((t, index) => {
          const isActive = index === trackIndex;
          return (
            <button
              key={t.id}
              className={`mp-track ${isActive ? "mp-track-active" : ""}`}
              onClick={() => selectTrack(index)}
            >
              {isActive && (
                <svg className="mp-track-icon" viewBox="0 0 20 20">
                  <use href={`/icons.svg#${isPlaying ? "pause-icon" : "play-icon"}`} />
                </svg>
              )}
              <span className="mp-track-title">{t.title}</span>
            </button>
          );
        })}
      </div>

      <div className="music-player-art">
        <img className="mp-layer mp-body" src="/cd-player/player.png" alt="" />
        <img className="mp-layer mp-disc" src="/cd-player/cd.png" alt="" />
        {isPlaying && (
          <div className="music-player-notes" aria-hidden="true">
            <span className="mp-note mp-note-1">♪</span>
            <span className="mp-note mp-note-2">♫</span>
            <span className="mp-note mp-note-3">♪</span>
            <span className="mp-note mp-note-4">♫</span>
            <span className="mp-note mp-note-5">♪</span>
          </div>
        )}
      </div>

      <div className="music-player-controls">
        <button className="mp-btn" onClick={() => changeTrack(-1)} aria-label="Previous track">
          <svg viewBox="0 0 20 20">
            <use href="/icons.svg#prev-icon" />
          </svg>
        </button>
        <button className="mp-btn mp-btn-main" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
          <svg viewBox="0 0 20 20">
            <use href={`/icons.svg#${isPlaying ? "pause-icon" : "play-icon"}`} />
          </svg>
        </button>
        <button className="mp-btn" onClick={() => changeTrack(1)} aria-label="Next track">
          <svg viewBox="0 0 20 20">
            <use href="/icons.svg#next-icon" />
          </svg>
        </button>
      </div>

      <p className="music-player-title">{track.title}</p>
    </div>
  );
}

export default MusicPlayer;
