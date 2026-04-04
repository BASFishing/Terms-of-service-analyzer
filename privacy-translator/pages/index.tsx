import { useState } from "react";
import { useRouter } from "next/router";
import type { Jurisdiction } from "../types";

type InputMode = "file" | "paste";

const STEPS = [
  "Extracting text…",
  "Mapping clauses to rights…",
  "Generating plain-language explanations…",
];

export default function Home() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("GDPR");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep(0);

    const formData = new FormData();
    formData.append("jurisdiction", jurisdiction);

    if (inputMode === "paste") {
      formData.append("text", pastedText);
    } else {
      if (!file) return;
      formData.append("file", file);
    }

    // Simulate step progression while waiting
    const stepTimer = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 4000);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      clearInterval(stepTimer);

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        const msg = body.error ?? "Analysis failed";
        throw new Error(res.status === 429 ? `⏱ ${msg}` : msg);
      }

      const result = await res.json();
      router.push({ pathname: "/results", query: { data: JSON.stringify(result) } });
    } catch (err) {
      clearInterval(stepTimer);
      setError(err instanceof Error ? err.message : "Analysis failed");
      setLoading(false);
    }
  }

  const canSubmit = inputMode === "paste"
    ? pastedText.trim().length > 50
    : file !== null;

  return (
    <main style={{ maxWidth: 600, margin: "60px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>Privacy Rights Analyzer</h1>
      <p>Upload or paste a Terms of Service or Privacy Policy to understand your rights.</p>

      {/* Input mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["file", "paste"] as InputMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => { setInputMode(mode); setError(null); }}
            style={{
              padding: "6px 16px",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: inputMode === mode ? "#1d4ed8" : "#fff",
              color: inputMode === mode ? "#fff" : "#333",
              cursor: "pointer",
              fontWeight: inputMode === mode ? 600 : 400,
            }}
          >
            {mode === "file" ? "Upload file" : "Paste text"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {inputMode === "file" ? (
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="file" style={{ display: "block", marginBottom: 6 }}>
              PDF, DOCX, MD, or TXT
            </label>
            <input
              id="file"
              type="file"
              accept=".pdf,.docx,.md,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p style={{ marginTop: 6, fontSize: 13, color: "#555" }}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="paste" style={{ display: "block", marginBottom: 6 }}>
              Paste document text
            </label>
            <textarea
              id="paste"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your Terms of Service or Privacy Policy here…"
              rows={10}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 4,
                border: "1px solid #ccc",
                fontFamily: "sans-serif",
                fontSize: 14,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
              {pastedText.trim().length} characters
            </p>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <fieldset style={{ border: "1px solid #ccc", borderRadius: 4, padding: "12px 16px" }}>
            <legend>Jurisdiction</legend>
            {(["GDPR", "CCPA"] as Jurisdiction[]).map((j) => (
              <label key={j} style={{ marginRight: 20 }}>
                <input
                  type="radio"
                  name="jurisdiction"
                  value={j}
                  checked={jurisdiction === j}
                  onChange={() => setJurisdiction(j)}
                  style={{ marginRight: 6 }}
                />
                {j}
              </label>
            ))}
          </fieldset>
        </div>

        {error && (
          <div style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: 4,
            padding: "10px 14px",
            color: "#991b1b",
            marginBottom: 16,
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: "16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>⏳</span>
              <span style={{ fontSize: 15, color: "#1d4ed8", fontWeight: 500 }}>
                {STEPS[step]}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: "10px 24px",
              background: canSubmit ? "#1d4ed8" : "#93c5fd",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 15,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            Analyze Document
          </button>
        )}
      </form>
    </main>
  );
}
