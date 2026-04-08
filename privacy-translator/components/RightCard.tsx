import type { RightAnalysis } from "../types";
import ConfidenceBadge from "./ConfidenceBadge";

interface Props {
  right: RightAnalysis;
}

export default function RightCard({ right }: Props) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 16,
      background: "#fafafa",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{right.rightName}</h3>
        <ConfidenceBadge confidence={right.confidence} />
      </div>

      <p style={{ fontSize: 14, color: "#333", marginBottom: 8 }}>{right.plainLanguage}</p>

      {right.gap && (
        <p style={{ fontSize: 13, color: "#b45309", background: "#fef3c7", padding: "6px 10px", borderRadius: 4, marginBottom: 8 }}>
          <strong>Gap:</strong> {right.gap}
        </p>
      )}

      {right.clauses.length > 0 && (
        <details style={{ fontSize: 13 }}>
          <summary style={{ cursor: "pointer", color: "#555" }}>
            {right.clauses.length} relevant clause{right.clauses.length !== 1 ? "s" : ""}
          </summary>
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            {right.clauses.map((clause, i) => (
              <li key={i} style={{ marginBottom: 6 }}>
                {clause.text}
                {clause.pageNumber != null && <span style={{ color: "#888" }}> (p. {clause.pageNumber})</span>}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p style={{ fontSize: 11, color: "#888", marginTop: 8, marginBottom: 0 }}>
        Source: {right.corpusEntry.version} — {right.corpusEntry.article ?? right.corpusEntry.section}
      </p>
    </div>
  );
}
