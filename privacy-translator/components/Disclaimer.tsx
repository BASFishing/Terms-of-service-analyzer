import { DISCLAIMER_TEXT } from "../prompts/disclaimer";

export default function Disclaimer() {
  return (
    <div style={{
      background: "#f1f5f9",
      border: "1px solid #cbd5e1",
      borderRadius: 6,
      padding: "12px 16px",
      fontSize: 13,
      color: "#475569",
      marginTop: 24,
    }}>
      <strong>Disclaimer: </strong>{DISCLAIMER_TEXT}
    </div>
  );
}
