import { useState } from "react";
import { useRouter } from "next/router";
import type { Jurisdiction } from "../types";

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("GDPR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jurisdiction", jurisdiction);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      router.push({ pathname: "/results", query: { data: JSON.stringify(result) } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "60px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>Privacy Rights Analyzer</h1>
      <p>Upload a Terms of Service or Privacy Policy PDF to understand your rights.</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="file" style={{ display: "block", marginBottom: 6 }}>
            PDF Document
          </label>
          <input
            id="file"
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>

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

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={!file || loading}>
          {loading ? "Analyzing…" : "Analyze Document"}
        </button>
      </form>
    </main>
  );
}
