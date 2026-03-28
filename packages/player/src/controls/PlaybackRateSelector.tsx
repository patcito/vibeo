const RATES = [0.25, 0.5, 1, 1.5, 2, 4] as const;

interface PlaybackRateSelectorProps {
  currentRate: number;
  onRateChange: (rate: number) => void;
}

export function PlaybackRateSelector({
  currentRate,
  onRateChange,
}: PlaybackRateSelectorProps) {
  return (
    <select
      value={currentRate}
      onChange={(e) => onRateChange(Number(e.target.value))}
      style={{
        background: "transparent",
        color: "white",
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: 4,
        padding: "2px 4px",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {RATES.map((rate) => (
        <option key={rate} value={rate} style={{ color: "black" }}>
          {rate}x
        </option>
      ))}
    </select>
  );
}
