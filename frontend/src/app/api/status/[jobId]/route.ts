import { NextRequest, NextResponse } from "next/server";

const REPO = process.env.GITHUB_REPO || "cliphijack/vidBoom";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const url = `https://raw.githubusercontent.com/${REPO}/results/${jobId}.json`;

  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 404) {
    return NextResponse.json({ status: "pending" });
  }
  if (!res.ok) {
    return NextResponse.json({ status: "error", error: "fetch failed" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ status: "done", results: data.results });
}
