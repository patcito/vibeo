import { Timeline } from "./Timeline.js";
import { PlaybackRateSelector } from "./PlaybackRateSelector.js";

interface PlayerControlsProps {
  playing: boolean;
  currentFrame: number;
  durationInFrames: number;
  firstFrame: number;
  playbackRate: number;
  fps: number;
  onToggle: () => void;
  onSeek: (frame: number) => void;
  onRateChange: (rate: number) => void;
}

function formatTime(frame: number, fps: number): string {
  const totalSeconds = frame / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PlayerControls({
  playing,
  currentFrame,
  durationInFrames,
  firstFrame,
  playbackRate,
  fps,
  onToggle,
  onSeek,
  onRateChange,
}: PlayerControlsProps) {
  const lastFrame = firstFrame + durationInFrames - 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: "rgba(0,0,0,0.7)",
        color: "white",
        fontSize: 12,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontSize: 16,
          padding: "0 4px",
          lineHeight: 1,
        }}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? "\u23F8" : "\u25B6"}
      </button>

      <Timeline
        currentFrame={currentFrame}
        durationInFrames={durationInFrames}
        firstFrame={firstFrame}
        onSeek={onSeek}
      />

      <span style={{ whiteSpace: "nowrap", minWidth: 60, textAlign: "center" }}>
        {formatTime(currentFrame, fps)} / {formatTime(lastFrame, fps)}
      </span>

      <span style={{ whiteSpace: "nowrap", opacity: 0.7, minWidth: 50 }}>
        f{currentFrame}
      </span>

      <PlaybackRateSelector
        currentRate={playbackRate}
        onRateChange={onRateChange}
      />
    </div>
  );
}
