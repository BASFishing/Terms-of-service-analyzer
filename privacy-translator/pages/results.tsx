import { useRouter } from "next/router";
import type { AnalysisResult } from "../types";
import RightCard from "../components/RightCard";
import Disclaimer from "../components/Disclaimer";

export default function Results() {
  const router = useRouter();
  const { data } = router.query;

  if (!data) {
    return <p style={{ padding: 40, fontFamily: "sans-serif" }}>No results. <a href="/">Go back</a></p>;
  }

  let result: AnalysisResult;
  try {
    result = JSON.parse(data as string);
  } catch {
    return <p style={{ padding: 40, fontFamily: "sans-serif" }}>Invalid result data. <a href="/">Go back</a></p>;
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>Analysis Results</h1>
      <p>
        <strong>Document:</strong> {result.documentName} &nbsp;|&nbsp;
        <strong>Jurisdiction:</strong> {result.jurisdiction} &nbsp;|&nbsp;
        <strong>Analyzed:</strong> {new Date(result.analyzedAt).toLocaleString()}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 16, margin: "24px 0" }}>
        {result.rights.map((right) => (
          <RightCard key={right.rightKey} right={right} />
        ))}
      </div>

      <Disclaimer />

      <p style={{ marginTop: 24 }}>
        <a href="/">Analyze another document</a>
      </p>
    </main>
  );
}
