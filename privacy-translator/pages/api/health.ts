import type { NextApiRequest, NextApiResponse } from "next";

interface HealthResponse {
  status: "ok";
  timestamp: string;
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
): void {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
}
