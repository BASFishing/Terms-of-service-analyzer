import type { ConfidenceLevel } from "../types";

interface Props {
  confidence: ConfidenceLevel;
}

const styles: Record<ConfidenceLevel, React.CSSProperties> = {
  Full: { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
  Partial: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
  Low: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
};

export default function ConfidenceBadge({ confidence }: Props) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 12,
      whiteSpace: "nowrap",
      ...styles[confidence],
    }}>
      {confidence}
    </span>
  );
}
